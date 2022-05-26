module.exports = {
	env: {
		'jest/globals': true,
		browser: true,
		commonjs: true,
		es2021: true,
	},
	root: true,
	extends: [ '@react-native-community' ],
	globals: {
		MyGlobal: true,
	},
	// plugins: [ 'jest' ],
	rules: {
		'no-console': 'off',
		// semi: [ 2, 'false' ],
		semi: [ 2, 'never' ],
		indent: [ 'error', 'tab' ],
		'object-curly-spacing': [ 'error', 'always' ],
		'array-bracket-spacing': [ 'error', 'always' ],
		'react/require-default-props': [ 'error' ],
		'react-hooks/exhaustive-deps': 'warn', // <--- THIS IS THE NEW RULE
		'react/default-props-match-prop-types': [ 'error' ],
		'react/sort-prop-types': [ 'error' ],
		'comma-spacing': [ 'error', { before: false, after: true } ],
		'no-inline-styles': false,
	},
}
