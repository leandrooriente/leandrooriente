import React from 'react';
import { mount, shallow } from 'enzyme';
import Button from './Button';

describe('<Button />', () => {
  const mockFn = jest.fn();
  it('should render <Button /> component as link when receive href prop', () => {
    const wrapper = mount(
      <Button href="https://test.com">
        test.com
      </Button>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should render <Button /> component as button when receive onClick prop', () => {
    const wrapper = mount(
      <Button onClick={mockFn}>
        submit
      </Button>
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should return null if missing href and onClick properties', () => {
    const wrapper = shallow(
      <Button>
        null
      </Button>
    );

    expect(wrapper.getElement()).toBe(null);
  });
});
