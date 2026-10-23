import { vi } from 'vitest';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
window.matchMedia = vi.fn(() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
window.scrollTo = vi.fn();
globalThis.ResizeObserver = class { observe() {} disconnect() {} };
