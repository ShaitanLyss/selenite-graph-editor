<script>
	import { faEarth } from '@fortawesome/free-solid-svg-icons';
	import EditorButton from './EditorButton.svelte';
	import { getContext } from 'svelte';
	import { notifications } from '@selenite/graph-editor';
	import { _ } from '$lib/global/index.svelte';

	const toggleGeos = getContext('toggleGeos');

	function onClick() {
		if (toggleGeos === undefined) {
			notifications.show({
				title: 'GEOS',
				message: $_('toggle-geos.failure.missing-toggle'),
				color: 'red'
			});
		} else {
			toggleGeos();
		}
	}
</script>

<EditorButton
	icon={faEarth}
	execNoNeedActiveFactory={onClick}
	tooltip={$_('editor.button.toggle-geos')}
/>
