// .eslintrc.js

module.exports = {
  // IMPORTANT: Extend the default Create React App ESLint config.
  extends: 'react-app',

  // Add a new 'settings' block to configure the alias resolver.
  settings: {
    'import/resolver': {
      alias: {
        map: [
          // Map the '@' alias to the 'src' directory.
          ['@', './src']
        ],
        extensions: ['.js', '.jsx', '.json']
      }
    }
  }
};
