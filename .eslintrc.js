module.exports = {
  extends: ['@dcl/eslint-config-dapps'],
  parserOptions: {
    project: ['tsconfig.json']
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off', // TODO: migrate code progressively to remove this line. https://typescript-eslint.io/rules/no-unsafe-assignment/
        '@typescript-eslint/no-unsafe-call': 'off', // TODO: migrate code progressively to remove this line. https://typescript-eslint.io/rules/no-unsafe-call/
        '@typescript-eslint/no-unsafe-member-access': 'off', // TODO: migrate code progressively to remove this line. https://typescript-eslint.io/rules/no-unsafe-member-access/
        '@typescript-eslint/no-unsafe-argument': 'off', // TODO: migrate code progressively to remove this line. https://typescript-eslint.io/rules/no-unsafe-argument/
        '@typescript-eslint/no-explicit-any': 'off', // TODO: migrate code progressively to remove this line. https://typescript-eslint.io/rules/no-explicit-any
        '@typescript-eslint/no-non-null-assertion': 'off' // TODO: migrate code progressively to remove this line. https://typescript-eslint.io/rules/no-non-null-assertion
      }
    },
    {
      files: ['*.spec.ts'],
      rules: {
        '@typescript-eslint/unbound-method': 'off'
      }
    },
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ],
  ignorePatterns: [
    '.eslintrc.js',
    'prettier.config.js',
    'src/contracts/*',
    'src/ecsScene/*',
    'scripts/*.js',
    'src/modules/project/export.ts',
    'src/modules/analytics/rollbar.ts',
    'src/modules/editor/base64.ts',
    'src/themes/index.ts'
  ]
}
