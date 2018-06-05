const marked = require('marked');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const articlesDir = path.resolve(__dirname, '..');

const consoleLog = () => console.log(arguments); // eslint-disable-line
const consoleError = () => console.error(arguments); // eslint-disable-line

const getHeading = (yamlContent) => {
  try {
    return yaml.safeLoad(yamlContent, 'utf8');
  } catch (error) {
    throw error;
  }
};

const getArticles = dir => fs
  .readdirSync(dir)
  .filter(filename => filename.indexOf('.md') !== -1)
  .map((filename) => {
    consoleLog(`Reading file: ${filename}`);
    const file = fs.readFileSync(`${dir}/${filename}`, { encoding: 'utf8' });

    const fileParts = file.split('---');
    const heading = getHeading(fileParts[0]);

    const content = (fileParts.slice(1, fileParts.length) || []).join();
    consoleLog(`Converting file: ${filename}`);

    const html = marked(content);

    return {
      ...heading,
      html,
    };
  });

const convertMarkdownToHTML = (dir) => {
  const articles = getArticles(dir);

  consoleLog('Writting articles map');
  const content = `/* eslint-disable */
    ${JSON.stringify(articles)}
  `;
  return fs.writeFileSync(
    path.resolve(__dirname, 'articles.js'),
    content
  );
};

try {
  convertMarkdownToHTML(articlesDir);
} catch (error) {
  consoleError('We couldn\'t generate articles, skipping step', error);
}

