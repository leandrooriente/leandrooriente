import React from 'react';
import PropTypes from 'prop-types';
import css from './Section.css';

const Section = ({ children }) => (
  <section className={css.wrapper}>
    { children }
  </section>
);

Section.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Section;
