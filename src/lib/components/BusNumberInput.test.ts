import { describe, it, expect } from 'vitest';
import { render } from 'svelte/server';
import BusNumberInput from './BusNumberInput.svelte';

describe('BusNumberInput', () => {
	it('renders without errors', () => {
		const { body } = render(BusNumberInput, { props: { onsubmit: () => {} } });
		expect(body).toContain('button');
	});

	it('renders the line selector', () => {
		const { body } = render(BusNumberInput, { props: { onsubmit: () => {} } });
		expect(body).toContain('select');
	});
});
