import React from 'react';
import Title from 'components/Title';
import css from './Headline.css';

const Headline = () => (
  <section className={css.headline}>
    <Title>
      Hi, I‘m Leandro Oriente, a front end developer at <a href="https://www.travix.com/">Travix</a> in Amsterdam.
    </Title>
  </section>
);

export default Headline;
