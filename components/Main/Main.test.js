import React from 'react';
import { mount } from 'enzyme';
import Main from './Main';

describe('<Main />', () => {
  it('should render <Header /> component', () => {
    const wrapper = mount(<Main />);

    expect(wrapper).toMatchSnapshot();
  });
});
