<script lang="ts">
	import { authStore } from '$lib/stores/auth-store.svelte';
	import { goto } from '$app/navigation';

	async function handleLogout() {
		await authStore.signOut();
		goto('/auth/login');
	}
</script>

<div class="flex min-h-svh items-center justify-center bg-base-100 p-4">
	<div class="card w-full max-w-sm bg-base-200 shadow-xl">
		<div class="card-body items-center text-center">
			<h2 class="card-title text-2xl">Waiting for Approval</h2>
			<p class="text-base-content/60">
				Your account has been created but needs to be approved by an admin before you can use the
				app.
			</p>
			<div class="card-actions mt-4">
				<button class="btn btn-outline" onclick={handleLogout}>Log Out</button>
			</div>
		</div>
	</div>
</div>
