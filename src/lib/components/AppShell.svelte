<script lang="ts">
	import { page } from '$app/state';
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const isHome = $derived(page.url.pathname === '/');
	const isHistory = $derived(page.url.pathname === '/history');
	const isAbout = $derived(page.url.pathname === '/about');
</script>

<div class="flex min-h-svh flex-col bg-base-100">
	<!-- Header -->
	<header class="navbar bg-primary text-primary-content shadow-md">
		<span class="text-xl font-bold">Bus Affair</span>
	</header>

	<!-- Content -->
	<main class="flex-1 overflow-y-auto p-4 pb-20">
		{@render children()}
	</main>

	<!-- Bottom dock nav -->
	<div class="dock dock-bottom">
		<a href="/" class:active={isHome}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span class="dock-label">Log</span>
		</a>
		<a href="/history" class:active={isHistory}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span class="dock-label">History</span>
		</a>
		<a href="/about" class:active={isAbout}>
			<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			<span class="dock-label">About</span>
		</a>
	</div>
</div>
