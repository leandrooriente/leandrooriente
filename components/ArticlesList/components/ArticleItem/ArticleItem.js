import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import Date from 'components/Date';
import ArticleShape from 'propTypes/article';
import css from './ArticleItem.css';

const ArticleItem = ({ article }) => (
  <div className={css.wrapper}>
    <p className={css.title}>
      <Link href={`/article${article.url}`}>
        <a className={css.link}>
          {article.title}
        </a>
      </Link>
    </p>
    <Date lang={article.lang} date={article.date} />
  </div>
);

ArticleItem.propTypes = {
  article: PropTypes.shape(ArticleShape).isRequired,
};

export default ArticleItem;
