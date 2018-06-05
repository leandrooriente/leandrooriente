import React from 'react';
import { mount } from 'enzyme';
import Section from './Section';

describe('<Section />', () => {
  it('should render <Section /> component', () => {
    const wrapper = mount(
      <Section>
        Test
      </Section>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
