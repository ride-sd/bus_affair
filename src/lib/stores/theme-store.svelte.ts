type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'bus-affair-theme';

let theme = $state<Theme>('system');
let mediaQuery: MediaQueryList | null = null;

function applyTheme() {
	const effective =
		theme === 'system'
			? window.matchMedia('(prefers-color-scheme: dark)').matches
				? 'dark'
				: 'light'
			: theme;
	document.documentElement.dataset.theme = effective;
}

export const themeStore = {
	get theme() {
		return theme;
	},

	init() {
		const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
		theme = stored ?? 'system';

		mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		mediaQuery.addEventListener('change', applyTheme);

		applyTheme();
	},

	set(newTheme: Theme) {
		theme = newTheme;
		localStorage.setItem(STORAGE_KEY, newTheme);
		applyTheme();
	}
};
