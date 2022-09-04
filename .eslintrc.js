module.exports = {
  extends: '@Alhadis',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    "consistent-this": 0,
    "prefer-rest-params": 0
  },
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
