module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature
        'fix', // Bug fix
        'docs', // Documentation only
        'style', // Formatting, missing semi colons, etc
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf', // Performance improvement
        'test', // Adding missing tests
        'chore', // Maintain, dependencies, config
        'ci', // CI configuration files and scripts
        'build', // Changes that affect the build system
        'revert', // Reverts a previous commit
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
};
