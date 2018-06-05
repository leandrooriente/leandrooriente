const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'Dezember',
];

const formatArticleDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

export default formatArticleDate;
