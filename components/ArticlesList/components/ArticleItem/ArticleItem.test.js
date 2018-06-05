import React from 'react';
import { mount } from 'enzyme';
import articles from 'data/articles';
import ArticleItem from './ArticleItem';

describe('<ArticleItem />', () => {
  it('should render <ArticleItem /> component', () => {
    const wrapper = mount(
      <ArticleItem article={articles[0]} />
    );

    expect(wrapper).toMatchSnapshot();
  });
});
