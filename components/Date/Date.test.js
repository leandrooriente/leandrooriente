import React from 'react';
import { mount } from 'enzyme';
import Date from './Date';

describe('<Date />', () => {
  it('should render a Date component showing date and language', () => {
    const wrapper = mount(
      <Date
        lang="portuguese"
        date="10/10/2010"
      />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should render a Date component showing beginning date and ending date', () => {
    const wrapper = mount(
      <Date
        date={['10/10/2010', '10/10/2012']}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
