import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import HoneybadgerSourceMapPlugin from '@honeybadger-io/rollup-plugin';

const isProduction = process.env.NODE_ENV === 'production';
const apiKey = process.env.PUBLIC_HONEYBADGER_API_KEY;
const revision = process.env.COMMIT_REF ?? 'development';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		sourcemap: isProduction ? 'hidden' : false,
		rollupOptions: {
			plugins: isProduction && apiKey
				? [
						// Upload for both the stable PR preview URL and the unique deploy URL so
						// source maps resolve regardless of which URL the user accessed.
						...[process.env.DEPLOY_PRIME_URL, process.env.DEPLOY_URL]
							.filter((url): url is string => !!url)
							.map((assetsUrl, i) =>
								// eslint-disable-next-line @typescript-eslint/no-explicit-any
								HoneybadgerSourceMapPlugin({
									apiKey,
									assetsUrl,
									revision,
									silent: false,
									retries: 3,
									// Only send deploy notification once
									deploy: i === 0 ? {
										environment: process.env.PUBLIC_HONEYBADGER_ENVIRONMENT ?? 'production',
										repository: process.env.REPOSITORY_URL
									} : false
								}) as any
							)
					]
				: []
		}
	},
	define: {
		'import.meta.env.VITE_COMMIT_REF': JSON.stringify(revision)
	},
	test: {
		include: ['src/**/*.test.ts']
	}
});
