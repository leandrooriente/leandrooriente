import React from 'react';
import { mount, shallow } from 'enzyme';
import articlesMock from '__mocks__/articles';
import ArticlesList from './ArticlesList';

describe('<ArticlesList />', () => {
  it('should render <ArticlesList /> component', () => {
    const wrapper = mount(
      <ArticlesList articles={articlesMock} />
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
