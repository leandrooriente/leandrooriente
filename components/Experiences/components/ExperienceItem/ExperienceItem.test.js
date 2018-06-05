import React from 'react';
import { mount } from 'enzyme';
import experiences from 'data/experiences';
import ExperienceItem from './ExperienceItem';

describe('<ExperienceItem />', () => {
  it('should render <ExperienceItem /> component', () => {
    const wrapper = mount(
      <ExperienceItem experience={experiences[0]} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
