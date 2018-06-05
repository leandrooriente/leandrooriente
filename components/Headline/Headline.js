import React from 'react';
import css from './Headline.css';

const Headline = () => (
  <section className={css.headline}>
    <h1 className={css.title}>
      Hi, I‘m Leandro Oriente, a front end developer at <a href="https://www.travix.com/">Travix</a> in Amsterdam.
    </h1>
  </section>
);

export default Headline;
