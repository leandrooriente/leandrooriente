import PropTypes from 'prop-types';

export default {
  role: PropTypes.string.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  companyName: PropTypes.string.isRequired,
  companyUrl: PropTypes.string,
  description: PropTypes.string.isRequired,
  stack: PropTypes.arrayOf(PropTypes.string).isRequired,
};
