import React from 'react';
import PropTypes from 'prop-types';
import formatArticleDate from 'helpers/formatArticleDate';
import css from './Date.css';

const Date = ({ date, lang, className }) => {
  const classes = `${css.details}${className ? ` ${className}` : ''}`;

  return (
    <div className={classes}>
      {formatArticleDate(date)} <span className={css.separator}>-</span> {lang}
    </div>
  );
};

Date.defaultProps = {
  className: null,
};

Date.propTypes = {
  className: PropTypes.string,
  date: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
};

export default Date;
