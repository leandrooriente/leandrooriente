import React from 'react';
import PropTypes from 'prop-types';
import ArticleShape from 'propTypes/article';
import Title from 'components/Title';
import Link from 'next/link';
import css from './Article.css';

const Back = () => (
  <Link>
    <a className={css.link} href="/">↤ Articles</a>
  </Link>
);

const Article = ({ article }) => (
  <article className={css.article}>
    <header>
      <Back />
      <Title className={css.title}>
        { article.title }
      </Title>
    </header>
    <div
      dangerouslySetInnerHTML={{__html: article.html}}  // eslint-disable-line
    />
    <Back />
  </article>
);

Article.propTypes = {
  article: PropTypes.shape(ArticleShape).isRequired,
};

export default Article;
