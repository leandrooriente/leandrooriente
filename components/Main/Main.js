import React from 'react';
import PropTypes from 'prop-types';
import css from './Main.css';

const Main = ({ children }) => (
  <section className={css.wrapper}>
    { children }
  </section>
);

Main.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Main;
