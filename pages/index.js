import React, { Fragment } from 'react';
import Main from '../components/Main';
import Header from '../components/Header';
import Headline from '../components/Headline';

export default () => (
  <Fragment>
    <Header />
    <Main>
      <Headline />
    </Main>
  </Fragment>
);
