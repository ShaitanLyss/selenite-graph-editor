<script lang="ts">
	import type {
		NodeEditor,
		NodeEditorSaveData,
		NodeFactory,
		setupEditor,
		Node
	} from '$graph-editor';
	import { XmlNode } from '$graph-editor/node/XML/XmlNode';

	import type { EditorExample } from '$graph-editor/example/types';
	import { capitalize, newLocalId, newUuid } from '$utils';
	import { _, getContext, keyboardShortcut, notifications } from '$lib/global/index.svelte';
	export let position = 'absolute';
	export let hidden = true;
	export let name = $_('editor.default-name');
	export let id = newLocalId('node-editor');

	export let loadExample: EditorExample | undefined = undefined;
	import { createEventDispatcher, onDestroy, onMount } from 'svelte';
	import { draw, fade } from 'svelte/transition';
	import { get } from 'svelte/store';
	import { isNodeEditorSaveData } from '$graph-editor/utils';
	import type { UUID } from 'crypto';
	import { GetGraphStore } from '$houdini';
	import { translateNodeFromGlobal } from '$utils/html';
	import type { ConnectionDropEvent } from '$graph-editor/setup/ConnectionSetup';
	import type { spawnMoonMenu as t_spawnMoonMenu } from '$lib/oldMenu/context-menu/moonContextMenu';
	import {
		moonMenuFactoryStore,
		newMoonItemsStore
	} from '$lib/oldMenu/context-menu/moonContextMenu';
	import type { MacroNode as t_MacroNode } from '$graph-editor/node/MacroNode';
	import { createNodeMenuItem, type IBaseMenuItem, type INodeMenuItem } from '$lib/oldMenu';
	import { VariableNode } from '$graph-editor/node/XML/VariableNode';
	import { possibleTypes, type Variable } from './overlay/variables-list';
	import { EditorType } from '.';
	import { getModalStore } from '@skeletonlabs/skeleton';

	let spawnMoonMenu: typeof t_spawnMoonMenu | undefined = undefined;
	let MacroNode: typeof t_MacroNode | undefined = undefined;
	let AreaExtensions: typeof import('rete-area-plugin').AreaExtensions | undefined = undefined;
	const geosContext = getContext('geos');
	const geosContextV2 = getContext('geos_v2');
	onMount(async () => {
		spawnMoonMenu = (await import('$lib/oldMenu/context-menu/moonContextMenu')).spawnMoonMenu;
		MacroNode = (await import('$graph-editor/node/MacroNode')).MacroNode;
		AreaExtensions = (await import('rete-area-plugin')).AreaExtensions;
	});

	export let editor: NodeEditor | undefined = undefined;
	export let factory: NodeFactory | undefined = undefined;
	export let saveData: NodeEditorSaveData | undefined = undefined;
	let container: HTMLElement;
	let editorData: Awaited<ReturnType<typeof setupEditor>>;
	const dispatch = createEventDispatcher<{ destroy: { id: string }; pointerdown: MouseEvent }>();

	let placeholderVisible = false;
	setTimeout(() => (placeholderVisible = true), 500);

	let firstShown = true;
	$: if (!hidden && firstShown && editorData?.firstDisplay) {
		firstShown = false;
		console.log('firstShown');
		setTimeout(() => editorData.firstDisplay(), 0);
	}

	$: editor = editorData?.editor;
	$: factory = editorData?.factory;
	let mounted = false;
	let newMoonItems: IBaseMenuItem[] = [];
	$: if ($newMoonItemsStore?.length > 0 && newMoonItems.length == 0) {
		newMoonItems = $newMoonItemsStore;
	}
	const tabsContext = getContext('tabs');
	const modalStore = getModalStore();
	onMount(async () => {
		await import('$graph-editor/setup/appLaunch');
		const { setupEditor } = await import('$graph-editor');
		editorData = await setupEditor({
			container,
			makutuClasses: {
				/* empty TODO */
			},
			loadExample,
			saveData,
			geosContext,
			geosContextV2,
			modalStore
		});
		editorData.editor.id = id;
		editorData.editor.setName(name);
		saveData = undefined;
		mounted = true;
		editorData.factory.getArea()?.addPipe((ctx) => {
			if (ctx.type === 'pointerdown') {
				dispatch('pointerdown', ctx.data.event);
			}
			return ctx;
		});
	});

	$: nameStore = editor?.nameStore;

	$: if (nameStore) {
		$tabsContext?.renameTab(id, $nameStore);
	}

	onDestroy(() => {
		if (editor === undefined) return;
		console.log(`Editor destroy ${editor.id}`);
		dispatch('destroy', { id: editor.id });
		editorData.destroy();
	});
	let nodesToFocus: undefined | Node[] = undefined;
	$: if (nodesToFocus) {
		console.log('focusing', nodesToFocus);

		setTimeout(() => {
			if (!nodesToFocus || nodesToFocus.length == 0) return;
			console.log('focusing', nodesToFocus);
			const area = factory?.getArea();
			if (!area) {
				nodesToFocus = undefined;
				return;
			}

			AreaExtensions?.zoomAt(area, nodesToFocus);
			nodesToFocus = undefined;
		}, 0);
	}

	function getVisibleNodes(): Node[] {
		if (!factory) {
			notifications.show({
				title: 'Error',
				message: 'No factory',
				color: 'red',
				icon: '<Fa icon={faCubesStacked} />'
			});

			return [];
		}
		const nodes = factory.getEditor().getNodes();
		const area = factory.getArea();
		if (!area) {
			notifications.show({
				title: 'Error',
				message: 'No area',
				color: 'red',
				icon: '<Fa icon={faCubesStacked} />'
			});

			return [];
		}
		const visibleNodes = nodes.filter((node) => {
			const nodeView = area.nodeViews.get(node.id);
			const containerRect = container.getBoundingClientRect();
			const elementRect = nodeView?.element.getBoundingClientRect();
			// console.log(node);

			// console.log('rect', elementRect);

			return (
				elementRect &&
				elementRect.top < containerRect.bottom &&
				elementRect.bottom > containerRect.top &&
				elementRect.left < containerRect.right &&
				elementRect.right > containerRect.left
			);
		});
		return visibleNodes;
	}
	async function onDrop(event: DragEvent) {
		if (!factory) throw new Error('No factory');
		if (!MacroNode) throw new Error('No MacroNode');
		const type = event.dataTransfer?.types[0];

		if (type === 'rete/macronode') {
			const graphId = event.dataTransfer?.getData('rete/macronode') as UUID;
			if (!graphId) throw new Error('No graph id');
			const graph = (await new GetGraphStore().fetch({ variables: { id: graphId } })).data?.graph
				.graph;
			if (!graph) throw new Error('Graph not found');
			console.log('Dropped', graph.name);
			const saveData = graph.editorData as NodeEditorSaveData;
			const node = await factory.addNode(MacroNode, {
				saveData: saveData,
				graphId,
				graphVersion: graph.version
			});
			if (!node) throw new Error('Node not created');
			// Move node to drop position
			translateNodeFromGlobal({
				center: false,
				globalPos: { x: event.clientX, y: event.clientY },
				node,
				factory
			});
		}

		if (type === 'application/graph-variable') {
			console.log('ctrl', event.ctrlKey, 'alt', event.altKey);
			const variable = JSON.parse(
				event.dataTransfer?.getData('application/graph-variable') ?? '{}'
			) as Variable;
			console.log('Dropped variable', variable);
			const node = await factory.addNode(VariableNode, { variableId: variable.id });
			if (!node) throw new Error('Node not created');
			// Move node to drop position
			translateNodeFromGlobal({
				globalPos: { x: event.clientX, y: event.clientY },
				center: true,
				node,
				factory
			});
		}

		// nodeView.translate(event.clientX - surfacePos.x, event.clientY - surfacePos.y);
	}

	function onConnectionDrop(event: ConnectionDropEvent) {
		if (!spawnMoonMenu) throw new Error('No spawnMoonMenu');
		if (!editor) throw new Error('No editor');
		$moonMenuFactoryStore = factory ?? null;
		console.log('connection drop on editor', event.socketData);
		const variables: INodeMenuItem[] = [];

		const promoteToVariable = createNodeMenuItem({
			label: 'Promote to variable',
			tags: ['variable'],
			addNode: () => {
				if (!factory) throw new Error('No factory');
				const editor = factory.getEditor();
				const node = editor.getNode(event.socketData.nodeId);
				const value =
					node instanceof XmlNode
						? node.state.attributeValues[event.socketData.key]
						: node.getData(event.socketData.key);
				console.log('promote to variable: node', node);
				console.log('promote to variable: value', value);
				console.log('promote to variable: event.socketData.payload', event.socketData.payload);
				const variable: Variable = {
					exposed: false,
					highlighted: false,
					id: newUuid('variable'),
					name: event.socketData.payload.name,
					type: event.socketData.payload.type,
					value,
					isArray: event.socketData.payload.isArray
				};
				factory.getEditor().variables.set({
					...get(factory.getEditor().variables),
					[variable.id]: variable
				});
				return new VariableNode({ factory, variableId: variable.id });
			},
			description: 'Promote the selected socket to a variable',
			editorType: EditorType.All,
			outTypes: possibleTypes
		});

		for (const v of Object.values(get(editor.variables))) {
			variables.push(
				createNodeMenuItem({
					label: v.name,
					outTypes: [v.type],
					menuPath: ['Variables'],
					editorType: EditorType.XML,
					addNode: () => {
						if (!factory) throw new Error('No factory');
						return new VariableNode({ factory, variableId: v.id });
					}
				})
			);
		}
		spawnMoonMenu({
			connDropEvent: event,
			items: [promoteToVariable, ...variables, ...newMoonItems],
			searchbar: true
		});
	}
	function undo() {
		factory?.history?.undo();
	}
	function redo() {
		factory?.history?.redo();
	}
</script>

{#if !mounted && !hidden && placeholderVisible}
	<div
		class="absolute h-full w-full flex justify-center items-center"
		transition:fade={{ duration: 200 }}
	>
		<!-- Loading.. -->
		<div class="card relative w-52 h-32">
			<div class="card-header">
				<div class="placeholder animate-pulse w-20" />
			</div>
			<div class="absolute right-0 translate-x-1/2 placeholder w-6 h-6 animate-pulse" />
			<div class="absolute left-0 bottom-4 -translate-x-3 flex gap-4">
				<div class=" placeholder w-6 h-6 animate-pulse" />
				<div class=" placeholder w-20 h-4 my-auto animate-pulse" />
			</div>
		</div>
	</div>
{/if}
<div
	bind:this={container}
	on:pointerdown={() => {
		window.getSelection()?.empty();
	}}
	class:opacity-0={!mounted || hidden}
	class="{position} transition-opacity h-full w-full bg-none {hidden
		? 'opacity-0 pointer-events-none'
		: ''}"
	role="region"
	use:keyboardShortcut={{ key: 'z', ctrl: true, action: undo, active: !hidden }}
	use:keyboardShortcut={{ key: 'z', ctrl: true, shift: true, action: redo, active: !hidden }}
	use:keyboardShortcut={{ key: 'y', ctrl: true, action: redo, active: !hidden }}
	on:connectiondrop={onConnectionDrop}
	on:dragenter={(event) => {
		if (!event.dataTransfer) return;
		if (['rete/macronode', 'application/graph-variable'].includes(event.dataTransfer?.types[0]))
			event.preventDefault();
	}}
	on:dragover={(event) => {
		if (!event.dataTransfer) return;
		if (['rete/macronode', 'application/graph-variable'].includes(event.dataTransfer?.types[0]))
			event.preventDefault();
	}}
	on:drop|preventDefault={onDrop}
/>
