// TODO - tests and clean

const marked = require('marked');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const articlesDir = __dirname;
const mapOutputPath = path.resolve(__dirname, '../data');
const articleOutputPath = slug => (
  path.resolve(__dirname, '../data', slug)
);

const consoleLog = console.log; // eslint-disable-line
const consoleError = console.error; // eslint-disable-line

const getHeading = (yamlContent) => {
  try {
    return yaml.safeLoad(yamlContent, 'utf8');
  } catch (error) {
    throw error;
  }
};

const writeArticleFile = (filePath, fileName, content) => {
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath);
  }

  return fs.writeFileSync(
    path.join(filePath, fileName),
    content
  );
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
    const slug = filename.replace('.md', '');

    return {
      ...heading,
      slug,
      url: `/${slug}`,
      html,
    };
  });

const formatObjectToWrite = object => `/* eslint-disable */
  export default ${JSON.stringify(object)};`;

const convertMarkdownToHTML = (dir) => {
  const articles = getArticles(dir);
  const map = articles.map(article => ({
    ...article,
    html: null,
  }));

  consoleLog('Writting articles map');
  writeArticleFile(
    mapOutputPath,
    'articles.js',
    formatObjectToWrite(map)
  );

  consoleLog('Writting articles files');
  articles.forEach((article) => {
    writeArticleFile(
      articleOutputPath(article.slug),
      'index.js',
      formatObjectToWrite(article)
    );
  });
};

try {
  convertMarkdownToHTML(articlesDir);
} catch (error) {
  writeArticleFile(
    mapOutputPath,
    'articles.js',
    'export default [];'
  );

  consoleError('We couldn\'t generate articles, skipping step', error);
}

