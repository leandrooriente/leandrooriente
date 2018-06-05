import React from 'react';
import { mount } from 'enzyme';
import articlesMock from '__mocks__/articles';
import Article from './Article';

describe('<Article />', () => {
  it('should render <Article /> component', () => {
    const wrapper = mount(
      <Article
        article={articlesMock[0]}
      />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
