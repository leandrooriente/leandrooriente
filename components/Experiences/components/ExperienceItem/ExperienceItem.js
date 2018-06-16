import React from 'react';
import PropTypes from 'prop-types';
import Badge from 'components/Badge';
import Date from 'components/Date';
import ExperienceShape from '../../propTypes/experience';
import css from './ExperienceItem.css';

const Experience = ({ experience }) => (
  <div className={css.wrapper}>
    <div className={css.headline}>
      <strong>{experience.companyName}</strong>
    </div>
    <Date date={[experience.startDate, experience.endDate]} />
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
