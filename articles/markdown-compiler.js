const marked = require('marked');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const articlesDir = __dirname;
const outputPath = path.resolve(__dirname, '../data', 'articles.js');

const consoleLog = console.log; // eslint-disable-line
const consoleError = console.error; // eslint-disable-line

const getHeading = (yamlContent) => {
  try {
    return yaml.safeLoad(yamlContent, 'utf8');
  } catch (error) {
    throw error;
  }
};

const writeArticleFile = (dir, content) =>
  fs.writeFileSync(dir, content);

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
    const slug = filename.replace('.md', '');

    return {
      ...heading,
      slug,
      url: `/${slug}`,
      html,
    };
  });

const convertMarkdownToHTML = (dir) => {
  const articles = getArticles(dir);

  consoleLog('Writting articles map');
  const content = `/* eslint-disable */
export default ${JSON.stringify(articles)}`;

  return writeArticleFile(
    outputPath,
    content
  );
};

try {
  convertMarkdownToHTML(articlesDir);
} catch (error) {
  writeArticleFile(
    outputPath,
    'export default [];'
  );

  consoleError('We couldn\'t generate articles, skipping step', error);
}

