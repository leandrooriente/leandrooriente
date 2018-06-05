import React from 'react';
import PropTypes from 'prop-types';
import { Flex, Box } from 'grid-styled';
import sortByDate from 'helpers/sortByDate';
import Subtitle from 'components/Subtitle';
import ArticleShape from './propTypes/article';
import ArticleItem from './components/ArticleItem';
import css from './ArticlesList.css';

const ArticlesList = ({ articles }) => {
  if (!articles || !articles.length) {
    return null;
  }

  const sortedByDateArticles = articles.sort(sortByDate);

  return (
    <section className={css.wrapper}>
      <Flex flexDirection={['column', 'row']}>
        <Box w={[1, 1 / 4]}>
          <Subtitle>Articles</Subtitle>
        </Box>
        <Box w={[1, 3 / 4]}>
          {sortedByDateArticles.map(article => (
            <ArticleItem article={article} key={article.id} />
          ))}
        </Box>
      </Flex>
    </section>
  );
};

ArticlesList.propTypes = {
  articles: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape(ArticleShape)
    ),
    PropTypes.array,
  ]).isRequired,
};

export default ArticlesList;
