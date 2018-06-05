module.exports = {
  parser: 'babel-eslint',
  extends: 'airbnb',
  settings: {
    'import/extensions': ['.js'],
    'import/resolver': {
      node: {},
      'babel-module': {
        root: ['./']
      }
    }
  },
  env: {
    jest: true,
    browser: true,
    node: true,
    es6: true,
  },
  plugins: ['react', 'jsx-a11y', 'import'],
  rules: {
    'comma-dangle': ['error', {
      'functions': 'ignore',
      'arrays': 'always-multiline',
      'objects': 'always-multiline',
      'imports': 'always-multiline',
      'exports': 'always-multiline',
    }],
    'jsx-a11y/anchor-is-valid': 0,
    'react/jsx-filename-extension': 0,
    'import/no-named-as-default-member': 0,
    'import/no-named-as-default': 0,
    'function-paren-newline': ['error', 'consistent']
  }
}
