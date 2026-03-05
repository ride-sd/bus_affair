<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import type { Snippet } from 'svelte';
	import { authStore } from '$lib/stores/auth-store.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	const isHome = $derived(page.url.pathname === '/');
	const isHistory = $derived(page.url.pathname === '/history');
	const isAbout = $derived(page.url.pathname === '/about');
	const isAdmin = $derived(page.url.pathname === '/admin');

	async function handleLogout() {
		await authStore.signOut();
		goto('/auth/login');
	}
</script>

<div class="flex min-h-svh flex-col bg-base-100">
	<!-- Header -->
	<header class="navbar bg-primary text-primary-content shadow-md">
		<div class="flex-1">
			<span class="text-xl font-bold">Bus Affair</span>
		</div>
		<div class="flex-none gap-2">
			<span class="text-sm opacity-80">{authStore.profile?.nickname}</span>
			<button class="btn btn-ghost btn-sm" onclick={handleLogout} aria-label="Log out">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
				</svg>
			</button>
		</div>
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
		{#if authStore.profile?.is_admin}
			<a href="/admin" class:active={isAdmin}>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
				</svg>
				<span class="dock-label">Admin</span>
			</a>
		{/if}
	</div>
</div>
