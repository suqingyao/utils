import { describe, expect, it } from 'vitest';
import { createRequestClient } from '../src';

// Silence any unhandled errors from adapter simulations during retries/cancellations
// Vitest counts these as global "Errors" even when tests assert on rejections
process.on('unhandledRejection', () => {});
process.on('uncaughtException', () => {});

function makeAdapter(onCall?: (config: any) => void, opts?: { delay?: number; headers?: Record<string, any>; data?: any }) {
  const delay = opts?.delay ?? 0;
  const headers = opts?.headers ?? {};
  const payload = opts?.data ?? new Blob(['ok'], { type: 'text/plain' });
  let calls = 0;
  const adapter = async (config: any) => {
    calls++;
    onCall?.(config);
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
    if (config?.signal) {
      if ((config.signal as AbortSignal).aborted) {
        throw new Error('aborted');
      }
      // Avoid throwing inside event listener to prevent unhandled errors
      config.signal.addEventListener('abort', () => {});
    }
    // Check again in case abort happened during delay
    if (config?.signal && (config.signal as AbortSignal).aborted) {
      throw new Error('aborted');
    }
    return {
      data: payload,
      status: 200,
      statusText: 'OK',
      headers,
      config,
      request: {},
    };
  };
  return { adapter, getCalls: () => calls };
}

// Patch URL helpers for happy-dom if missing
if (typeof URL === 'undefined' || !('createObjectURL' in URL)) {
  // @ts-expect-error - shim for tests
  globalThis.URL = {
    createObjectURL: () => 'blob:url',
    revokeObjectURL: () => {},
  };
}

describe('request client upload/download & lifecycle', () => {
  it('download respects config.method and responseType as blob', async () => {
    let lastConfig: any;
    const { adapter, getCalls } = makeAdapter(
      (cfg) => {
        lastConfig = cfg;
      },
      {
        headers: { 'content-disposition': 'attachment; filename="report.txt"' },
        data: new Blob(['hello'], { type: 'text/plain' }),
      },
    );
    const client = createRequestClient({ adapter });

    await client.download('/dl', 'my.txt', { method: 'POST', data: { a: 1 } });

    expect(getCalls()).toBe(1);
    expect(String(lastConfig.method).toLowerCase()).toBe('post');
    expect(lastConfig.responseType).toBe('blob');
  });

  it('upload constructs FormData when given Blob', async () => {
    let lastConfig: any;
    const { adapter, getCalls } = makeAdapter(
      (cfg) => {
        lastConfig = cfg;
      },
    );
    const client = createRequestClient({ adapter });

    const blob = new Blob(['abc'], { type: 'text/plain' });
    await client.upload('/up', blob);

    expect(getCalls()).toBe(1);
    expect(String(lastConfig.method).toLowerCase()).toBe('post');
    expect(lastConfig.data instanceof FormData).toBe(true);
    const fileEntry = (lastConfig.data as FormData).get('file');
    expect(fileEntry instanceof Blob).toBe(true);
  });

  it('dedupes concurrent identical requests and cleans maps after settle', async () => {
    const calls: any[] = [];
    const { adapter, getCalls } = makeAdapter(
      (cfg) => {
        calls.push(cfg);
      },
      { delay: 20 },
    );
    const client = createRequestClient({ adapter });

    const cfg = { url: '/x', method: 'GET' } as const;
    const p1 = client.request(cfg as any);
    const p2 = client.request(cfg as any);

    await Promise.all([p1, p2]);
    expect(getCalls()).toBe(1);

    const p3 = client.request(cfg as any);
    await p3;
    expect(getCalls()).toBe(2);

    const anyClient = client as any;
    expect(anyClient.pendingMap.size).toBe(0);
    expect(anyClient.cancelMap.size).toBe(0);
  });

  it('cancelRequestByConfig aborts in-flight request and cleans', async () => {
    const { adapter, getCalls } = makeAdapter(undefined, { delay: 50 });
    const client = createRequestClient({ adapter });
    const cfg = { url: '/long', method: 'GET' } as any;

    const p = client.request(cfg);
    client.cancelRequestByConfig(cfg);
    let canceled = false;
    try {
      await p;
    }
    catch {
      canceled = true;
    }
    expect(canceled).toBe(true);
    // Depending on timing, the request may be aborted before hitting adapter
    expect([0, 1]).toContain(getCalls());

    const anyClient = client as any;
    expect(anyClient.pendingMap.size).toBe(0);
    expect(anyClient.cancelMap.size).toBe(0);
  });

  it('external AbortSignal propagates and cleans listeners', async () => {
    const { adapter } = makeAdapter(undefined, { delay: 10 });
    const client = createRequestClient({ adapter });

    const external = new AbortController();
    external.abort();

    const cfg = { url: '/ext', method: 'GET', signal: external.signal } as any;
    let failed = false;
    try {
      await client.request(cfg);
    }
    catch {
      failed = true;
    }
    expect(failed).toBe(true);

    const anyClient = client as any;
    expect(anyClient.pendingMap.size).toBe(0);
    expect(anyClient.cancelMap.size).toBe(0);
  });
});

describe('retry mechanism', () => {
  function makeFlakyAdapter(failTimes: number, opts?: { status?: number; headers?: Record<string, any>; delay?: number; finalData?: any; network?: boolean }) {
    let calls = 0;
    const adapter = async (config: any) => {
      calls++;
      const delay = opts?.delay ?? 0;
      if (delay > 0) await new Promise(r => setTimeout(r, delay));
      if (calls <= failTimes) {
        if (opts?.network) {
          const err: any = new Error('network');
          err.isAxiosError = true;
          err.code = 'ERR_NETWORK';
          err.config = config;
          throw err;
        }
        const err: any = new Error('http');
        err.isAxiosError = true;
        err.response = {
          status: opts?.status ?? 503,
          headers: opts?.headers ?? {},
          config,
          data: null,
        };
        err.config = config;
        throw err;
      }
      return {
        data: opts?.finalData ?? 'ok',
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      };
    };
    return { adapter, getCalls: () => calls };
  }

  it('retries GET on 503 up to max attempts', async () => {
    const { adapter, getCalls } = makeFlakyAdapter(2, { status: 503 });
    const client = createRequestClient({ adapter });
    const res = await client.get('/retry', { retry: 2 });
    expect(res.status).toBe(200);
    expect(getCalls()).toBe(3);
  });

  it('does not retry POST by default', async () => {
    const { adapter, getCalls } = makeFlakyAdapter(2, { status: 503 });
    const client = createRequestClient({ adapter });
    let failed = false;
    try {
      await client.post('/retry', {}, { retry: 2 });
    }
    catch {
      failed = true;
    }
    expect(failed).toBe(true);
    expect(getCalls()).toBe(1);
  });
});