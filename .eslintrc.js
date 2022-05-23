module.exports = {
  env: {
    es2021: true,
  },
  'extends': [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    "prettier"
  ],
  rules: {
    //'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    //'no-console': 'off',
    //'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  },
}