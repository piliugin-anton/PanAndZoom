module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    {
      files: [
        "test/*"
      ],
      globals: {
        expect: true
      }
    }
  ]
};
