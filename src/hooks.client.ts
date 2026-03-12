import Honeybadger from '@honeybadger-io/js';
import { PUBLIC_HONEYBADGER_API_KEY, PUBLIC_HONEYBADGER_ENVIRONMENT } from '$env/static/public';
import type { HandleClientError } from '@sveltejs/kit';

Honeybadger.configure({
	apiKey: PUBLIC_HONEYBADGER_API_KEY,
	environment: PUBLIC_HONEYBADGER_ENVIRONMENT,
	revision: import.meta.env.VITE_COMMIT_REF ?? 'development',
	projectRoot: '/'
});

export const handleError: HandleClientError = ({ error, event }) => {
	Honeybadger.notify(error as Error, {
		context: { url: event.url.pathname }
	});
};
