import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import HoneybadgerSourceMapPlugin from '@honeybadger-io/rollup-plugin';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		...(process.env.NODE_ENV === 'production' && process.env.PUBLIC_HONEYBADGER_API_KEY
			? [
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
				HoneybadgerSourceMapPlugin({
						apiKey: process.env.PUBLIC_HONEYBADGER_API_KEY,
						assetsUrl: process.env.DEPLOY_URL ?? 'http://localhost:5173',
						revision: process.env.COMMIT_REF ?? 'development',
						silent: false,
						retries: 3
					}) as any
				]
			: [])
	],
	define: {
		'import.meta.env.VITE_COMMIT_REF': JSON.stringify(process.env.COMMIT_REF ?? 'development')
	},
	test: {
		include: ['src/**/*.test.ts']
	}
});
