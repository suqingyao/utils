const target = typeof window === 'undefined' ? globalThis : window;
const vendors = ['webkit', 'ms', 'moz', 'o'];

let _raf: any = (target as unknown as Window).requestAnimationFrame;
let _caf: any = (target as unknown as Window).cancelAnimationFrame;

if (!_raf || !_caf) {
  vendors.some((prefix) => {
    _raf = (target as any)[`${prefix}RequestAnimationFrame`];
    _caf
      = (target as any)[`${prefix}CancelAnimationFrame`]
        || (target as any)[`${prefix}CancelRequestAnimationFrame`];
    return _raf && _caf;
  });

  if (!_raf || !_caf) {
    let lastTime = 0;
    _raf = function (cb: () => void) {
      const currentTime = Date.now();
      const diff = Math.max(0, 16 - (currentTime - lastTime));
      const timer = setTimeout(() => {
        cb();
        lastTime = currentTime + diff;
      }, diff);
      return timer;
    };

    _caf = function (timer: number) {
      clearTimeout(timer);
    };
  }
}

const raf = _raf.bind(target);
const caf = _caf.bind(target);

export { caf, raf };
