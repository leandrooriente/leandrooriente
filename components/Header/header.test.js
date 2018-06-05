import React from 'react';
import { mount } from 'enzyme';
import Header from './header';

describe('<Header />', () => {
  it('should render <Header /> component', () => {
    const wrapper = mount(<Header />);

    expect(wrapper).toMatchSnapshot();
  });
});
