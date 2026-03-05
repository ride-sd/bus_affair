<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import AppShell from '$lib/components/AppShell.svelte';
	import { authStore } from '$lib/stores/auth-store.svelte';
	import { encounterStore } from '$lib/stores/encounter-store.svelte';
	import { fleetStore } from '$lib/stores/fleet-store.svelte';

	let { children } = $props();

	const isAuthPage = $derived(page.url.pathname.startsWith('/auth/'));
	let encounterStoreInitialized = false;

	onMount(() => {
		fleetStore.init();
		authStore.init();
	});

	$effect(() => {
		if (authStore.loading) return;

		const path = page.url.pathname;
		const onAuthPage = path.startsWith('/auth/');

		if (!authStore.user && !onAuthPage) {
			goto('/auth/login');
		} else if (authStore.user && !authStore.profile && !onAuthPage) {
			// Stale session — profile no longer exists (e.g. after db reset)
			authStore.signOut();
			goto('/auth/login');
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
{/if}
