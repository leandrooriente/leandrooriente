import formatArticleDate from './formatArticleDate';

describe('helpers - formatArticleDate', () => {
  it('should return original value when receiving a non compatible string Date', () => {
    expect(formatArticleDate('foo.bar')).toBe('foo.bar');
  });

  it('should return a formated date using Month YYYY notation', () => {
    expect(formatArticleDate('2014-03-09')).toBe('March 2014');
    expect(formatArticleDate('Mon Jun 04 2018 01:43:15 GMT+0200 (CEST)')).toBe('June 2018');
  });
});
