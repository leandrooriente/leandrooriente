import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Head from 'next/head';
import Main from 'components/Main';
import Section from 'components/Section';
import Article from 'components/Article';
import GetInTouch from 'components/GetInTouch';
import ArticleShape from 'propTypes/article';

export default class extends Component {
  static async getInitialProps({ query }) {
    const article = require(`../data/${query.id}`).default; // eslint-disable-line

    return { article };
  }

  static propTypes = {
    article: PropTypes.shape(ArticleShape).isRequired,
  }

  render() {
    const { article } = this.props;

    return (
      <Main>
        <Head>
          <title>{article.title} - Leandro Oriente</title>
        </Head>

        <Article article={article} />

        <Section>
          <GetInTouch />
        </Section>
      </Main>
    );
  }
}
