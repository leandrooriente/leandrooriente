import React from 'react';
import { mount } from 'enzyme';
import GetInTouch from './GetInTouch';

describe('<GetInTouch />', () => {
  it('should render <GetInTouch /> component', () => {
    const wrapper = mount(<GetInTouch />);

    expect(wrapper).toMatchSnapshot();
  });
});
