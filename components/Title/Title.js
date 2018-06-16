import React from 'react';
import PropTypes from 'prop-types';
import css from './Title.css';

const Title = ({ children, className }) => {
  const classes = `${css.title}${className ? ` ${className}` : ''}`;
  return (
    <h1 className={classes}>
      { children }
    </h1>
  );
};

Title.defaultProps = {
  className: null,
};

Title.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Title;
