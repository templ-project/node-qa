import eslintrcjs from './eslintrc-js';

export default {
    ...eslintrcjs,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', ...eslintrcjs.plugins],
    rules: {
        '@typescript-eslint/object-curly-spacing': 'off',
        '@typescript-eslint/space-infix-ops': 'off',
        ...eslintrcjs.rules
    }
}