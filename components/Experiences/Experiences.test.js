import React from 'react';
import { mount, shallow } from 'enzyme';
import experiences from 'data/experiences';
import Experiences from './Experiences';

describe('<Experiences />', () => {
  it('should render <Experiences /> component', () => {
    const wrapper = mount(
      <Experiences experiences={experiences} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should return null when case receive an empty array of experiences', () => {
    const wrapper = shallow(
      <Experiences experiences={[]} />
    );

    expect(wrapper.getElement()).toBe(null);
  });
});
