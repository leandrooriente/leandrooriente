import React from 'react';
import Link from 'next/link';
import css from './Back.css';

const Back = () => (
  <Link href="/">
    <a className={css.link}>↤ Articles</a>
  </Link>
);

export default Back;
