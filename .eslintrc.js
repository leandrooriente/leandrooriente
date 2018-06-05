module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb',
  env: {
    browser: true,
    jest: true
  },
  settings: {
    'import/extensions': ['.js'],
  },
  plugins: ['react', 'jsx-a11y', 'import'],
  rules: {
    'react/jsx-filename-extension': 0,
    'import/no-named-as-default-member': 0,
    'import/no-named-as-default': 0,
  }
}
