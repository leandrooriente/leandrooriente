import React from 'react';
import { mount } from 'enzyme';
import articlesMock from '__mocks__/articles';
import ArticleItem from './ArticleItem';

describe('<ArticleItem />', () => {
  it('should render <ArticleItem /> component', () => {
    const wrapper = mount(
      <ArticleItem article={articlesMock[0]} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
