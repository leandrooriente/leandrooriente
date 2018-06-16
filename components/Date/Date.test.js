import React from 'react';
import { mount } from 'enzyme';
import Date from './Date';

describe('<Date />', () => {
  it('should render <Date /> component', () => {
    const wrapper = mount(
      <Date
        lang="portuguese"
        date="10/10/2010"
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
