const marked = require('marked');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const articlesDir = path.resolve(__dirname, 'articles');
const tmpDir = path.resolve(__dirname, '.tmp');

const getHeading = (yamlContent) => {
  try {
    return yaml.safeLoad(yamlContent, 'utf8');
  } catch (error) {
    throw error;
  }
};

const getArticles = dir => fs
  .readdirSync(dir)
  .map((filename) => {
    console.log(`Reading file: ${filename}`);
    const file = fs.readFileSync(`${dir}/${filename}`, { encoding: 'utf8' });

    const fileParts = file.split('---');
    const heading = getHeading(fileParts[0]);

    const content = (fileParts.slice(1, fileParts.length) || []).join();
    console.log(`Converting file: ${filename}`);

    const html = marked(content);

    return {
      ...heading,
      html,
    };
  });

const convertMarkdownToHTML = (dir) => {
  const articles = getArticles(dir);

  console.log('Writting articles map');
  return fs.writeFileSync(
    path.resolve(tmpDir, 'articles.js'),
    JSON.stringify(articles)
  );
};

try {
  convertMarkdownToHTML(articlesDir);
} catch (error) {
  console.error('We couldn\'t generate articles, skipping step', error);
}
