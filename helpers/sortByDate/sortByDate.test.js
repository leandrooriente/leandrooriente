import sortByDate from './sortByDate';

describe('helpers - sortByDate', () => {
  it('should return null when receiving a non compatible string Date', () => {
    expect(sortByDate({ date: 'foo.bar' }, { date: '01/01/2017' })).toBeFalsy();
    expect(sortByDate({ date: '01/01/2017' }, { date: 'foo.bar' })).toBeFalsy();
  });

  it('should return false if first date was more recent than second', () => {
    expect(sortByDate({ date: '01/01/2017' }, { date: '01/01/2015' })).toBeFalsy();
  });

  it('should return true if second date was more recent than first', () => {
    expect(sortByDate({ date: '01/01/2015' }, { date: '01/01/2017' })).toBeTruthy();
  });
});
