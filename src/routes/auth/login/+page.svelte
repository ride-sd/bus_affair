<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth-store.svelte';

	let nickname = $state('');
	let password = $state('');
	let error = $state('');
	let submitting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		submitting = true;

		try {
			await authStore.signIn(nickname, password);
			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Login failed';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="flex min-h-svh items-center justify-center bg-base-100 p-4">
	<div class="card w-full max-w-sm bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center text-2xl">Bus Affair</h2>
			<p class="text-center text-base-content/60">Sign in with your nickname</p>

			{#if error}
				<div class="alert alert-error text-sm">{error}</div>
			{/if}

			<form onsubmit={handleSubmit} class="flex flex-col gap-4">
				<label class="floating-label">
					<span>Nickname</span>
					<input
						type="text"
						class="input input-bordered w-full"
						placeholder="Nickname"
						bind:value={nickname}
						required
						autocapitalize="none"
						autocorrect="off"
					/>
				</label>

				<label class="floating-label">
					<span>Password</span>
					<input
						type="password"
						class="input input-bordered w-full"
						placeholder="Password"
						bind:value={password}
						required
					/>
				</label>

				<button type="submit" class="btn btn-primary w-full" disabled={submitting}>
					{#if submitting}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						Sign In
					{/if}
				</button>
			</form>

			<p class="text-center text-sm">
				No account? <a href="/auth/signup" class="link link-primary">Sign up</a>
			</p>
		</div>
	</div>
</div>
