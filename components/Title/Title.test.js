import React from 'react';
import { mount } from 'enzyme';
import Title from './Title';

describe('<Title />', () => {
  it('should render <Title /> component', () => {
    const wrapper = mount(<Title>Test</Title>);

    expect(wrapper).toMatchSnapshot();
  });
});
