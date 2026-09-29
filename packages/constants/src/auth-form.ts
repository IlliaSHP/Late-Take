export const AUTH_FORM_CONTENT = {
	login: {
		title: 'Welcome back!',
		submit: 'Log in',
		pending: 'Logging in...',
		footerText: "Don't have an account?",
		footerAction: 'Sign up',
		footerHref: '/register'
	},
	register: {
		title: 'Create account',
		submit: 'Create account',
		pending: 'Creating...',
		footerText: 'Already have an account?',
		footerAction: 'Log in',
		footerHref: '/login'
	}
} as const