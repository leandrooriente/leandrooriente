import React from 'react';
import PropTypes from 'prop-types';
import css from './Badge.css';

const Badge = ({ children, className }) => {
  const classes = `${css.badge}${className ? ` ${className}` : ''}`;

  return (
    <span className={classes}>
      { children }
    </span>
  );
};

Badge.defaultProps = {
  className: null,
};

Badge.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Badge;
