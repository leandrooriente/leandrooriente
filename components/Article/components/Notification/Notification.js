import React from 'react';
import PropTypes from 'prop-types';
import css from './Notification.css';

const Notification = ({ date }) => {
  const articleDate = new Date(date);

  if (Number.isNaN(articleDate.getTime())) {
    return null;
  }

  const actualDate = new Date();
  const articleAge = actualDate.getFullYear() - articleDate.getFullYear();

  if (articleAge <= 2) return null;

  return (
    <div className={css.notification}>
      Este artigo possui mais de {articleAge} anos de existência.
      O seu conteúdo pode estar desatualizado ou pode não representar
      mais minha opinião.
    </div>
  );
};

Notification.propTypes = {
  date: PropTypes.string.isRequired,
};

export default Notification;
