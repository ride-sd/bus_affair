declare module '@honeybadger-io/rollup-plugin' {
	import type { Plugin } from 'rollup';
	function HoneybadgerSourceMapPlugin(options: {
		apiKey: string;
		assetsUrl: string;
		revision?: string;
		silent?: boolean;
		retries?: number;
		deploy?: boolean | {
			environment?: string;
			repository?: string;
			localUsername?: string;
		};
	}): Plugin;
	export default HoneybadgerSourceMapPlugin;
}
