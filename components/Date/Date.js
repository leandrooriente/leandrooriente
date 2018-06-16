import React from 'react';
import PropTypes from 'prop-types';
import formatArticleDate from 'helpers/formatArticleDate';
import css from './Date.css';

const Date = ({ date, lang, className }) => {
  const classes = `${css.details}${className ? ` ${className}` : ''}`;

  if (Array.isArray(date)) {
    return (
      <div className={classes}>
        {formatArticleDate(date[0])}
        <span className={css.separator}>-</span>
        {formatArticleDate(date[1])}
      </div>
    );
  }

  return (
    <div className={classes}>
      {formatArticleDate(date)} <span className={css.separator}>-</span> {lang}
    </div>
  );
};

Date.defaultProps = {
  className: null,
  lang: undefined,
};

Date.propTypes = {
  className: PropTypes.string,
  date: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(
      PropTypes.string,
    ),
  ]).isRequired,
  lang: PropTypes.string,
};

export default Date;
