<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth-store.svelte';

	async function handleSignOut() {
		await authStore.signOut();
		goto('/auth/login');
	}
</script>

<div class="flex min-h-svh items-center justify-center bg-base-100 p-4">
	<div class="w-full max-w-sm">
		<div class="card bg-base-200 shadow-sm">
			<div class="card-body items-center text-center gap-4">
				<div class="text-5xl">🚌</div>
				<h2 class="card-title">Waiting for Approval</h2>
				<p class="text-base-content/70">
					Your account is pending admin approval. You'll be able to log in once an admin has
					approved your request.
				</p>
				<button class="btn btn-ghost btn-sm mt-2" onclick={handleSignOut}>Sign out</button>
			</div>
		</div>
	</div>
</div>
