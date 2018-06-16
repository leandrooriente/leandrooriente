import React from 'react';
import PropTypes from 'prop-types';
import ArticleShape from 'propTypes/article';
import Title from 'components/Title';
import Date from 'components/Date';
import Comments from 'components/Comments';
import Back from './components/Back';
import Notification from './components/Notification';
import css from './Article.css';

const Article = ({ article }) => (
  <article className={css.article}>
    <header className={css.header}>
      <Back />
      <Title className={css.title}>
        { article.title }
      </Title>
      <Date
        lang={article.lang}
        date={article.date}
      />
    </header>

    <Notification date={article.date} />

    <div
      dangerouslySetInnerHTML={{__html: article.html}}  // eslint-disable-line
    />

    <Comments />

    <Back />
  </article>
);

Article.propTypes = {
  article: PropTypes.shape(ArticleShape).isRequired,
};

export default Article;
