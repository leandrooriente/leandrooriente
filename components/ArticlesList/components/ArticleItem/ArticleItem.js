import React from 'react';
import PropTypes from 'prop-types';
import formatArticleDate from 'helpers/formatArticleDate';
import Badge from 'components/Badge';
import Link from 'next/link';
import ArticleShape from '../../propTypes/article';
import css from './ArticleItem.css';

const ArticleItem = ({ article }) => (
  <div className={css.wrapper}>
    <p className={css.title}>
      <Link href={article.url}>
        <a className={css.link} href={article.url}>
          {article.title}
        </a>
      </Link>
    </p>
    <div>
      <Badge>{formatArticleDate(article.date)}</Badge>
      <Badge>{article.lang}</Badge>
    </div>
  </div>
);

ArticleItem.propTypes = {
  article: PropTypes.shape(ArticleShape).isRequired,
};

export default ArticleItem;
