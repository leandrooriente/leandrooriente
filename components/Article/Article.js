import React from 'react';
import PropTypes from 'prop-types';
import ArticleShape from 'propTypes/article';
import Title from 'components/Title';
import Back from './components/Back';
import Notification from './components/Notification';
import css from './Article.css';

const Article = ({ article }) => (
  <article className={css.article}>
    <header>
      <Back />
      <Title className={css.title}>
        { article.title }
      </Title>
    </header>

    <Notification date={article.date} />

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
