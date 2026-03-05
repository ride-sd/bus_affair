<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { supabase } from '$lib/supabase';
	import { authStore } from '$lib/stores/auth-store.svelte';

	interface UserRow {
		id: string;
		nickname: string;
		approved: boolean;
		is_admin: boolean;
		created_at: string;
	}

	let pendingUsers = $state<UserRow[]>([]);
	let allUsers = $state<UserRow[]>([]);
	let loading = $state(true);
	let error = $state('');
	let resetPasswordUserId = $state<string | null>(null);
	let newPassword = $state('');

	onMount(() => {
		if (!authStore.profile?.is_admin) {
			goto('/');
			return;
		}
		loadUsers();
	});

	async function loadUsers() {
		loading = true;
		error = '';

		const [pendingRes, allRes] = await Promise.all([
			supabase.rpc('get_pending_users'),
			supabase.rpc('get_all_users')
		]);

		if (pendingRes.error) {
			error = pendingRes.error.message;
		} else {
			pendingUsers = pendingRes.data ?? [];
		}

		if (allRes.error) {
			error = allRes.error.message;
		} else {
			allUsers = allRes.data ?? [];
		}

		loading = false;
	}

	async function approveUser(userId: string) {
		const { error: err } = await supabase.rpc('approve_user', { target_user_id: userId });
		if (err) {
			error = err.message;
		} else {
			await loadUsers();
		}
	}

	async function resetPassword(userId: string) {
		if (!newPassword) return;
		const { error: err } = await supabase.rpc('admin_reset_password', {
			target_user_id: userId,
			new_password: newPassword
		});
		if (err) {
			error = err.message;
		} else {
			resetPasswordUserId = null;
			newPassword = '';
		}
	}
</script>

<div class="flex flex-col gap-6">
	<h1 class="text-2xl font-bold">Admin</h1>

	{#if error}
		<div class="alert alert-error text-sm">{error}</div>
	{/if}

	{#if loading}
		<div class="flex justify-center">
			<span class="loading loading-spinner loading-lg"></span>
		</div>
	{:else}
		<!-- Pending Users -->
		<section>
			<h2 class="mb-2 text-lg font-semibold">Pending Approval</h2>
			{#if pendingUsers.length === 0}
				<p class="text-base-content/60">No pending users.</p>
			{:else}
				<div class="flex flex-col gap-2">
					{#each pendingUsers as pending (pending.id)}
						<div class="flex items-center justify-between rounded-lg bg-base-200 p-3">
							<span class="font-medium">{pending.nickname}</span>
							<button class="btn btn-success btn-sm" onclick={() => approveUser(pending.id)}>
								Approve
							</button>
						</div>
					{/each}
				</div>
			{/if}
		</section>

		<!-- All Users -->
		<section>
			<h2 class="mb-2 text-lg font-semibold">All Users</h2>
			<div class="flex flex-col gap-2">
				{#each allUsers as u (u.id)}
					<div class="rounded-lg bg-base-200 p-3">
						<div class="flex items-center justify-between">
							<div>
								<span class="font-medium">{u.nickname}</span>
								{#if u.is_admin}
									<span class="badge badge-primary badge-sm ml-2">admin</span>
								{/if}
								{#if !u.approved}
									<span class="badge badge-warning badge-sm ml-2">pending</span>
								{/if}
							</div>
							<button
								class="btn btn-outline btn-sm"
								onclick={() => {
									resetPasswordUserId = resetPasswordUserId === u.id ? null : u.id;
									newPassword = '';
								}}
							>
								Reset Password
							</button>
						</div>
						{#if resetPasswordUserId === u.id}
							<div class="mt-2 flex gap-2">
								<input
									type="password"
									class="input input-bordered input-sm flex-1"
									placeholder="New password"
									bind:value={newPassword}
									minlength="6"
								/>
								<button class="btn btn-primary btn-sm" onclick={() => resetPassword(u.id)}>
									Set
								</button>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}
</div>
