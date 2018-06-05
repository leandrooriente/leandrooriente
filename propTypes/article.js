import PropTypes from 'prop-types';

export default {
  slug: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  author: PropTypes.string.isRequired,
  lang: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  thumbnail: PropTypes.string.isRequired,
  html: PropTypes.string,
};
