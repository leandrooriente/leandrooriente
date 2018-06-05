import React from 'react';
import { mount, shallow } from 'enzyme';
import Notification from './Notification';

describe('<Notification />', () => {
  const date = new Date();
  const actualYear = date.getFullYear();
  const olderThanTwoYears = `10/10/${actualYear - 3}`;
  const newerThanTwoYears = `10/10/${actualYear - 1}`;

  it('should render <Notification /> component if article is older than 2 years', () => {
    const wrapper = mount(<Notification date={olderThanTwoYears} />);

    expect(wrapper).toMatchSnapshot();
  });

  it('should return null if article is newer than 2 years', () => {
    const wrapper = shallow(<Notification date={newerThanTwoYears} />);

    expect(wrapper.getElement()).toBe(null);
  });

  it('should return null if date is invalid', () => {
    const wrapper = shallow(<Notification date="test" />);

    expect(wrapper.getElement()).toBe(null);
  });
});
