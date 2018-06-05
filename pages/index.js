import React from 'react';
import Head from 'next/head';
import Main from 'components/Main';
import Section from 'components/Section';
import Headline from 'components/Headline';
import Experiences from 'components/Experiences';
import ArticlesList from 'components/ArticlesList';
import GetInTouch from 'components/GetInTouch';

import experiences from 'data/experiences';
import articles from 'data/articles';

export default () => (
  <Main>
    <Head>
      <title>Leandro Oriente - Front End Developer</title>
    </Head>

    <Headline />

    <Section>
      <Experiences experiences={experiences} />
    </Section>

    <Section>
      <ArticlesList articles={articles} />
    </Section>

    <Section>
      <GetInTouch />
    </Section>
  </Main>
);
