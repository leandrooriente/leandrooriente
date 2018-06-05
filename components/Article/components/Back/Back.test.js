import React from 'react';
import { mount } from 'enzyme';
import Back from './Back';

describe('<Back />', () => {
  it('should render <Back /> component', () => {
    const wrapper = mount(<Back />);

    expect(wrapper).toMatchSnapshot();
  });
});
