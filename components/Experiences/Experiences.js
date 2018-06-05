import React from 'react';
import PropTypes from 'prop-types';
import Subtitle from 'components/Subtitle';
import css from './Experiences.css';

const Experiences = ({ children }) => (
  <section className={css.wrapper}>
    <Subtitle>Experiences</Subtitle>
  </section>
);

Experiences.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Experiences;
