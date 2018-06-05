import React from 'react';
import { mount } from 'enzyme';
import Headline from './Headline';

describe('<Headline />', () => {
  it('should render <Header /> component', () => {
    const wrapper = mount(<Headline />);

    expect(wrapper).toMatchSnapshot();
  });
});
