import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import css from './Button.css';

const Button = ({
  className,
  children,
  onClick,
  href,
}) => {
  const classes = `${css.button}${className ? ` ${className}` : ''}`;
  if (onClick) {
    return (
      <button className={classes} onClick={onClick}>
        { children }
      </button>
    );
  }

  if (href) {
    return (
      <Link href={href}>
        <a className={classes}>{ children }</a>
      </Link>
    );
  }

  return null;
};

Button.defaultProps = {
  className: null,
  href: null,
  onClick: null,
};

Button.propTypes = {
  className: PropTypes.string,
  href: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default Button;
