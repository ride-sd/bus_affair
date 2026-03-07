<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import { authStore } from '$lib/stores/auth-store.svelte';
	import { encounterStore } from '$lib/stores/encounter-store.svelte';
	import { fleetStore } from '$lib/stores/fleet-store.svelte';
	import { themeStore } from '$lib/stores/theme-store.svelte';

	let { children } = $props();

	const isAuthPage = $derived(page.url.pathname.startsWith('/auth/'));
	const isPublicPage = $derived(page.url.pathname === '/lookup');
	let encounterStoreInitialized = false;

	onMount(() => {
		themeStore.init();
		fleetStore.init();
		authStore.init();
	});

	$effect(() => {
		if (authStore.loading) return;

		const path = page.url.pathname;
		const onAuthPage = path.startsWith('/auth/');

		if (!authStore.user && !onAuthPage && !isPublicPage) {
			goto('/lookup');
		} else if (authStore.user && !authStore.profile && !onAuthPage && !isPublicPage) {
			// Stale session — profile no longer exists (e.g. after db reset)
			authStore.signOut();
			goto('/lookup');
		} else if (authStore.user && authStore.profile && !authStore.profile.approved && path !== '/auth/pending') {
			goto('/auth/pending');
		} else if (authStore.user && authStore.profile?.approved && !encounterStoreInitialized) {
			encounterStoreInitialized = true;
			encounterStore.init(authStore.user.id);
		}
	});
</script>

{#if authStore.loading}
	<div class="flex min-h-svh items-center justify-center">
		<span class="loading loading-spinner loading-lg"></span>
	</div>
{:else if isAuthPage}
	{@render children()}
{:else if authStore.user && authStore.profile?.approved}
	<AppShell>
		{@render children()}
	</AppShell>
{:else if isPublicPage}
	<div class="flex min-h-svh flex-col bg-base-100">
		<header class="navbar bg-primary text-primary-content shadow-md">
			<div class="flex-1">
				<span class="text-xl font-bold">Bus Affair</span>
			</div>
			<a href="/auth/login" class="btn btn-ghost btn-sm">Sign In</a>
		</header>
		<main class="flex-1 p-4">
			{@render children()}
		</main>
	</div>
{:else}
	<div class="flex min-h-svh items-center justify-center">
		<a href="/lookup" class="btn btn-primary">Go to App</a>
	</div>
{/if}
