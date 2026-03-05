<script lang="ts">
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth-store.svelte';

	let nickname = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let loading = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = null;
		loading = true;
		try {
			await authStore.signIn(nickname.trim(), password);
			goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Sign in failed.';
			if (error === 'Your account is pending admin approval.') {
				goto('/auth/pending');
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-svh items-center justify-center bg-base-100 p-4">
	<div class="w-full max-w-sm">
		<h1 class="mb-6 text-center text-3xl font-bold">Bus Affair</h1>

		<div class="card bg-base-200 shadow-sm">
			<div class="card-body">
				<h2 class="card-title">Sign In</h2>

				<form onsubmit={handleSubmit} class="flex flex-col gap-4">
					<div class="form-control">
						<label class="label" for="nickname">
							<span class="label-text">Username</span>
						</label>
						<input
							id="nickname"
							type="text"
							class="input input-bordered"
							placeholder="your username"
							bind:value={nickname}
							required
							autocomplete="username"
						/>
					</div>

					<div class="form-control">
						<label class="label" for="password">
							<span class="label-text">Password</span>
						</label>
						<input
							id="password"
							type="password"
							class="input input-bordered"
							placeholder="password"
							bind:value={password}
							required
							autocomplete="current-password"
						/>
					</div>

					{#if error}
						<p class="text-sm text-error">{error}</p>
					{/if}

					<button type="submit" class="btn btn-primary" disabled={loading}>
						{#if loading}
							<span class="loading loading-spinner loading-sm"></span>
						{/if}
						Sign In
					</button>
				</form>

				<div class="divider"></div>

				<p class="text-center text-sm text-base-content/60">
					Don't have an account?
					<a href="/auth/signup" class="link link-primary">Sign up</a>
				</p>
			</div>
		</div>
	</div>
</div>
