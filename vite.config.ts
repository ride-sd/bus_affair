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
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						HoneybadgerSourceMapPlugin({
							apiKey,
							assetsUrl: process.env.DEPLOY_URL ?? 'http://localhost:5173',
							revision,
							silent: false,
						retries: 3,
							deploy: {
								environment: process.env.PUBLIC_HONEYBADGER_ENVIRONMENT ?? 'production',
								repository: process.env.REPOSITORY_URL
							}
						}) as any
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
