import React from 'react';
import { mount, shallow } from 'enzyme';
import articles from 'data/articles';
import ArticlesList from './ArticlesList';

describe('<ArticlesList />', () => {
  it('should render <ArticlesList /> component', () => {
    const wrapper = mount(
      <ArticlesList articles={articles} />
    );

    expect(wrapper).toMatchSnapshot();
  });

  it('should return null when case receive an empty array of articles', () => {
    const wrapper = shallow(
      <ArticlesList articles={[]} />
    );

    expect(wrapper.getElement()).toBe(null);
  });
});
