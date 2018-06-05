import React from 'react';
import PropTypes from 'prop-types';
import css from './Title.css';

const Title = ({ children }) => (
  <h1 className={css.title}>
    { children }
  </h1>
);

Title.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Title;
