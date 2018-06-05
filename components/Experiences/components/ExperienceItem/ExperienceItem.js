import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Badge from 'components/Badge';
import ExperienceShape from '../../propTypes/experience';
import css from './ExperienceItem.css';

const Experience = ({ experience }) => (
  <div className={css.wrapper}>
    <div className={css.headline}>
      <strong>{experience.companyName}</strong>
      <Fragment> | </Fragment>
      <span>{experience.startDate}</span> - <span>{experience.endDate}</span>
    </div>
    <div
      className={css.description}
      dangerouslySetInnerHTML={{__html: experience.description}} // eslint-disable-line
    />
    <div className={css.stack}>
      {experience.stack.map(tech => (
        <Badge className={css.badge} key={tech}>{tech}</Badge>
      ))}
    </div>
  </div>
);

Experience.propTypes = {
  experience: PropTypes.shape(ExperienceShape).isRequired,
};

export default Experience;
