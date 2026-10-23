import { useTransition } from './TransitionContext';
import PropTypes from 'prop-types';

export function TransitionLink({
  to,
  variant,
  hash,
  replace,
  children,
  onClick,
  ...rest
}) {
  const ctx = useTransition();
  const href = typeof to === 'string' ? to : to?.pathname || '/';
  const handle = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
      return;
    e.preventDefault();
    if (ctx) ctx.go(to, { variant, hash, replace });
    else window.location.assign(href);
  };
  return (
    <a
      href={hash && href === '/' ? `/#${String(hash).replace(/^#/, '')}` : href}
      onClick={handle}
      {...rest}
    >
      {children}
    </a>
  );
}

TransitionLink.propTypes = {
  to: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({ pathname: PropTypes.string.isRequired }),
  ]).isRequired,
  variant: PropTypes.string,
  hash: PropTypes.string,
  replace: PropTypes.bool,
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
};
