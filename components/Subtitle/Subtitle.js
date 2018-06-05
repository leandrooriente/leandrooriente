import React from 'react';
import PropTypes from 'prop-types';
import css from './Subtitle.css';

const Subtitle = ({ children }) => (
  <h3 className={css.title}>
    { children }
  </h3>
);

Subtitle.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Subtitle;
