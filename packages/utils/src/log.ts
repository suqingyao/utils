const LOG_COLOR = {
  DEFAULT: '\x1B[0m',
  INFO: '\x1B[34m',
  SUCCESS: '\x1B[32m',
  WARNING: '\x1B[33m',
  ERROR: '\x1B[31m',
} as const;

type LOG_COLOR_KEY = keyof typeof LOG_COLOR;

export class Logger {
  private prefix = '';

  constructor(prefix: string = '', colorPreset: Record<LOG_COLOR_KEY, string> = LOG_COLOR) {
    this.prefix = prefix.trim().toUpperCase();
    Object.assign(LOG_COLOR, colorPreset);
  }

  log(color: LOG_COLOR_KEY = 'DEFAULT', message: string) {
    // eslint-disable-next-line no-console
    console.log(`${LOG_COLOR[color]}${this.prefix}${message}${LOG_COLOR[color]}`);
  }

  info(message: string) {
    this.log('INFO', message);
  }

  success(message: string) {
    this.log('SUCCESS', message);
  }

  warning(message: string) {
    this.log('WARNING', message);
  }

  error(message: string) {
    this.log('ERROR', message);
  }
}

const logger = new Logger('');

export default logger;
