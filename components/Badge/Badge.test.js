import React from 'react';
import { mount } from 'enzyme';
import Badge from './Badge';

describe('<Badge />', () => {
  it('should render <Badge /> component', () => {
    const wrapper = mount(
      <Badge>
        Test
      </Badge>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
