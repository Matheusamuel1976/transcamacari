let scroller = null;
export const setScroller = (instance) => {
  scroller = instance;
};
export function scrollTo(target, immediate = false) {
  const offset =
    typeof target === 'number'
      ? 0
      : -(
          document.querySelector('.navbar')?.getBoundingClientRect().height ||
          80
        ) - 12;
  const top =
    typeof target === 'number'
      ? target
      : target.getBoundingClientRect().top + window.scrollY + offset;
  if (scroller) {
    scroller.resize();
    scroller.scrollTo(top, { immediate, force: true });
  } else window.scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' });
}
