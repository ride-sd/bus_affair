import type { User } from '@supabase/supabase-js';
import { supabase } from '$lib/supabase';

export interface Profile {
	id: string;
	nickname: string;
	approved: boolean;
	is_admin: boolean;
}

let user = $state<User | null>(null);
let profile = $state<Profile | null>(null);
let loading = $state(true);

async function fetchProfile(userId: string): Promise<Profile | null> {
	const { data, error } = await supabase
		.from('profiles')
		.select('id, nickname, approved, is_admin')
		.eq('id', userId)
		.maybeSingle();

	if (error) {
		console.error('Failed to fetch profile:', error);
		return null;
	}
	return data as Profile | null;
}

export const authStore = {
	get user() {
		return user;
	},
	get profile() {
		return profile;
	},
	get loading() {
		return loading;
	},

	async init() {
		const {
			data: { session }
		} = await supabase.auth.getSession();

		if (session?.user) {
			user = session.user;
			profile = await fetchProfile(session.user.id);
		}
		loading = false;

		supabase.auth.onAuthStateChange(async (_event, session) => {
			if (session?.user) {
				user = session.user;
				profile = await fetchProfile(session.user.id);
			} else {
				user = null;
				profile = null;
			}
		});
	},

	async signUp(nickname: string, password: string) {
		const email = `${nickname}@stub.busaffair.com`;
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: { display_name: nickname, nickname }
			}
		});

		if (error) throw error;

		user = data.user;
		if (data.user) {
			profile = await fetchProfile(data.user.id);
		}
	},

	async signIn(nickname: string, password: string) {
		const email = `${nickname}@stub.busaffair.com`;
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password
		});

		if (error) throw error;

		user = data.user;
		profile = await fetchProfile(data.user.id);

		if (profile && !profile.approved) {
			throw new Error('Your account is pending admin approval.');
		}
	},

	async signOut() {
		await supabase.auth.signOut();
		user = null;
		profile = null;
	}
};
