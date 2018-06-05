import React from 'react';
import { mount } from 'enzyme';
import Subtitle from './Subtitle';

describe('<Subtitle />', () => {
  it('should render <Subtitle /> component', () => {
    const wrapper = mount(
      <Subtitle>
        Test
      </Subtitle>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
