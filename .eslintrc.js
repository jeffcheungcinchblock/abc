module.exports = {
	env: {
		'jest/globals': true,
	},
	root: true,
	extends: [ '@react-native-community' ],
	plugins: [ 'jest' ],
	rules: {
		'semi': [ 'error', 'never' ],
		'indent': [ 'error', 'tab' ],
		'object-curly-spacing': [ 'error', 'always' ],
		'array-bracket-spacing': [ 'error', 'always' ],
		'react/require-default-props': [ 'error' ],
    "react-hooks/exhaustive-deps": 'warn', // <--- THIS IS THE NEW RULE
		'react/default-props-match-prop-types': [ 'error' ],
		'react/sort-prop-types': [ 'error' ],
		'comma-spacing' : [ 'error', { before: false, after: true } ],
	},
	settings: {
		'import/resolver': {
			'babel-module': {},
		},
	},
}
