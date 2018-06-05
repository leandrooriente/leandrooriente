import React from 'react';
import { mount } from 'enzyme';
import Main from './Main';

describe('<Main />', () => {
  it('should render <Header /> component', () => {
    const wrapper = mount(
      <Main>
        <span>Children</span>
      </Main>
    );

    expect(wrapper).toMatchSnapshot();
  });
});
