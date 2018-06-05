import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import Subtitle from 'components/Subtitle';
import ExperienceItem from './components/ExperienceItem';
import ExperienceShape from './propTypes/experience';
import css from './Experiences.css';

const Experiences = ({ experiences }) => {
  if (!experiences || !experiences.length) {
    return null;
  }

  return (
    <section className={css.wrapper}>
      <Flex flexDirection={['column', 'row']}>
        <Box w={[1, 1 / 4]}>
          <Subtitle>Experience</Subtitle>
        </Box>
        <Box w={[1, 3 / 4]}>
          {experiences.map(experience => (
            <ExperienceItem experience={experience} key={experience.companyName} />
          ))}
        </Box>
      </Flex>
    </section>
  );
};

Experiences.propTypes = {
  experiences: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape(ExperienceShape)
    ),
    PropTypes.array,
  ]).isRequired,
};

export default Experiences;
