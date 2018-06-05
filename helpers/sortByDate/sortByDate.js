export default (a, b) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);

  if (
    Number.isNaN(dateA.getTime()) ||
    Number.isNaN(dateB.getTime())
  ) {
    return null;
  }

  return (new Date(b.date) - new Date(a.date)) > 0;
};
