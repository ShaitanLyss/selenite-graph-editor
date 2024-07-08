import { capitalizeWords } from '$utils/string';
import { type Setup } from '$graph-editor/setup';
import { _ } from '$lib/global';
import { NodeFactory } from '$graph-editor/editor';
import { Node, nodeRegistry } from '$graph-editor/nodes';
import { get } from 'svelte/store';
import wu from 'wu';
import type { SelectorEntity } from 'rete-area-plugin/_types/extensions/selectable';
import type { Position } from '$graph-editor/common';
import type { MenuItem } from './types';
import { clientToSurfacePos } from '$utils/html';

export * from './context-menu.svelte';
export { default as ContextMenuComponent } from './ContextMenu.svelte';
// export class ContextMenuSetup extends SetupClass {
// 	selectedNodes: SelectorEntity[] = [];
// 	async setup(
// 		editor: NodeEditor,
// 		area: AreaPlugin<Schemes, AreaExtra>,
// 		__factory: NodeFactory,
// 		geos: GeosDataContext,
// 		geosContextV2: NewGeosContext
// 	): Promise<void> {
// 		const xmlSchema = (await new GetXmlSchemaStore().fetch()).data?.geos.xmlSchema;

// 		const newMoonItems: IBaseMenuItem[] = [];

// 		if (xmlSchema) {
// 			const moonItems: MoonMenuItem[] = [];
// 			const complexTypesWithName: string[] = [];
// 			const complexTypes: string[] = [];

// 			for (const complexType of xmlSchema.complexTypes) {
// 				if (complexType === PendingValue) continue;
// 				const name = complexType.name.match(/^(.*)Type$/)?.at(1);
// 				if (!name) throw new Error(`Invalid complex type name: ${complexType.name}`);

// 				const hasNameAttribute = complexType.attributes.some((attr) => attr.name === 'name');
// 				if (hasNameAttribute) complexTypesWithName.push(name);

// 				complexTypes.push(name);
// 				const xmlNodeAction: (factory: NodeFactory) => Node = (factory) =>
// 					new XmlNode({
// 						label: name,
// 						factory: factory,

// 						xmlConfig: {
// 							noName: !hasNameAttribute,
// 							childTypes: complexType.childTypes.map((childType) => {
// 								const childName = childType.match(/^(.*)Type$/)?.at(1);
// 								if (!childName) return childType;
// 								return childName;
// 							}),
// 							xmlTag: name,
// 							outData: {
// 								name: name,
// 								type: `xmlElement:${name}`,
// 								socketLabel: name
// 							},

// 							xmlProperties: complexType.attributes.map<XmlAttributeDefinition>((attr) => {
// 								console.log(attr);

// 								const simpleType = geosContextV2.geosSchema.simpleTypes.get(attr.type);
// 								if (!simpleType) console.warn(`Simple type ${attr.type} not found`);

// 								return {
// 									name: attr.name,
// 									required: attr.required,
// 									options: simpleType?.enum ?? null,
// 									pattern: simpleType?.pattern,
// 									type: attr.type,
// 									controlType: 'text'
// 								};
// 							})
// 						}
// 					});
// 				const typesPaths = geos.typesPaths;
// 				if (typesPaths)
// 					newMoonItems.push(
// 						createNodeMenuItem({
// 							label: name,
// 							menuPath: (get(typesPaths) as Record<string, string[]>)[name],
// 							addNode: xmlNodeAction,
// 							inTypes: complexType.childTypes.map((childType) => {
// 								const childName = childType.match(/^(.*)Type$/)?.at(1);
// 								if (!childName) return childType;
// 								return childName;
// 							}),
// 							outTypes: [name]
// 						})
// 					);
// 				moonItems.push({
// 					label: name,
// 					outType: name,
// 					inChildrenTypes: complexType.childTypes.map((childType) => {
// 						const childName = childType.match(/^(.*)Type$/)?.at(1);
// 						if (!childName) return childType;
// 						return childName;
// 					}),
// 					action: xmlNodeAction
// 				});
// 				pushMenuItem(items, ['XML', complexType.name], () => xmlNodeAction(__factory), __factory);
// 			}
// 			const getNameNodeItem: MoonMenuItem = {
// 				action: (factory) => new GetNameNode({ factory }),
// 				inChildrenTypes: complexTypesWithName,
// 				label: 'Get Name',
// 				outType: 'string'
// 			};
// 			const makeArrayNodeItem: MoonMenuItem = {
// 				action: (factory) => new MakeArrayNode({ factory }),
// 				inChildrenTypes: [],
// 				label: 'Make Array',
// 				outType: 'array'
// 			};
// 			const stringNodeItem: MoonMenuItem = {
// 				action: (factory) => new StringNode({ factory }),
// 				inChildrenTypes: [],
// 				label: 'String',
// 				outType: 'string'
// 			};
// 			const downloadSchemaItem: MoonMenuItem = {
// 				action: (factory) => new DownloadNode({ factory }),
// 				inChildrenTypes: ['Problem'],
// 				label: 'Download',
// 				outType: ''
// 			};
// 			moonMenuItemsStore.set([
// 				stringNodeItem,
// 				getNameNodeItem,
// 				makeArrayNodeItem,
// 				downloadSchemaItem,
// 				...moonItems
// 			]);
// 			newMoonItems.push(
// 				createNodeMenuItem({
// 					label: 'Get Name',
// 					addNode: getNameNodeItem.action,
// 					inTypes: complexTypesWithName,
// 					outTypes: ['groupNameRef'],
// 					description: 'Get the name of the GEOS element',
// 					tags: ['name', 'get']
// 				}),
// 				createNodeMenuItem({
// 					label: 'String',
// 					addNode: stringNodeItem.action,
// 					inTypes: [],
// 					outTypes: ['string'],
// 					description: 'Create a string',
// 					tags: ['string', 'create', 'basic'],
// 					menuPath: ['String']
// 				}),
// 				createNodeMenuItem({
// 					label: 'Display',
// 					addNode: (factory) => new DisplayNode({ factory }),
// 					inTypes: ['*'],
// 					tags: ['display', 'data', 'vizualization'],
// 					description: 'Display the input',
// 					menuPath: ['I/O']
// 				}),
// 				createNodeMenuItem({
// 					label: 'Select',
// 					addNode: (factory) => new SelectNode({ factory }),
// 					inTypes: ['*'],
// 					outTypes: ['*'],
// 					tags: ['select', 'choice']
// 				}),
// 				createNodeMenuItem({
// 					label: 'Format',
// 					addNode: (factory) => new FormatNode({ factory }),
// 					inTypes: ['*'],
// 					outTypes: ['groupNameRef'],
// 					tags: ['format', 'string']
// 				}),
// 				createNodeMenuItem({
// 					label: 'Make Array',
// 					addNode: makeArrayNodeItem.action,
// 					inTypes: ['*'],
// 					outTypes: ['array'],
// 					description: 'Make an array from the input',
// 					tags: ['array', 'make'],
// 					menuPath: ['Array']
// 				}),
// 				createNodeMenuItem({
// 					label: 'Not',
// 					addNode: (factory) => new NotNode({ factory }),
// 					inTypes: ['boolean'],
// 					outTypes: ['boolean'],
// 					description: 'Invert the input',
// 					tags: ['boolean', 'invert', 'not', '!'],
// 					menuPath: ['Boolean']
// 				}),
// 				createNodeMenuItem({
// 					label: 'Merge Arrays',
// 					addNode: (factory) => new MergeArrays({ factory }),
// 					inTypes: ['*'],
// 					outTypes: ['array'],
// 					description: 'Make an array from the input',
// 					tags: ['array', 'make'],
// 					menuPath: ['Array']
// 				}),
// 				createNodeMenuItem({
// 					label: 'Download',
// 					addNode: downloadSchemaItem.action,
// 					inTypes: [...geosContextV2.geosSchema.complexTypes.keys()],
// 					description: 'Download the problem as xml',
// 					tags: ['download', 'xml'],
// 					menuPath: ['I/O']
// 				})
// 			);

// 			newMoonItemsStore.set([...newMoonItems]);
// 		}

// 		const contextMenu = new ContextMenuPlugin<Schemes>({
// 			items: Presets.classic.setup(getMenuArray(items))
// 		});

// 		area.addPipe((context) => {
// 			if ((['pointermove', 'render', 'rendered'] as (typeof context.type)[]).includes(context.type))
// 				return context;
// 			const selector = __factory.selector;
// 			if (!selector) throw new ErrorWNotif("Selector doesn't exist");
// 			if (context.type === 'pointerdown') {
// 				const event = context.data.event;
// 				const nodeDiv =
// 					event.target instanceof HTMLElement
// 						? event.target.classList.contains('node')
// 							? event.target
// 							: event.target.closest('.node')
// 						: null;
// 				if (
// 					event.target instanceof HTMLElement &&
// 					event.button === 2 &&
// 					(event.target.classList.contains('node') || event.target.closest('.node')) !== null
// 				) {
// 					const entries = Array(...area.nodeViews.entries());

// 					const nodeId = entries.find((t) => t[1].element === nodeDiv?.parentElement)?.[0];
// 					if (!nodeId) return context;
// 					__factory.selectableNodes?.select(nodeId, true);
// 					const selectedNodes = wu(selector.entities.values())
// 						.filter((t) => editor.getNode(t.id) !== undefined)
// 						.toArray();
// 					// console.log('remember selected', selectedNodes);
// 					if (selectedNodes.length > 0) {
// 						this.selectedNodes = selectedNodes;
// 					}
// 				}
// 			}
// 			if (context.type === 'contextmenu') {
// 				// Context menu on node
// 				if (context.data.context !== 'root') {
// 					if (!(context.data.context instanceof Node)) return context;

// 					context.data.event.preventDefault();
// 					context.data.event.stopImmediatePropagation();
// 					return;
// 				}
// 				// Context menu on editor
// 				context.data.event.preventDefault();
// 				const variables: INodeMenuItem[] = [];

// 				for (const v of Object.values(get(editor.variables))) {
// 					variables.push(
// 						createNodeMenuItem({
// 							label: v.name,
// 							outTypes: [v.type],
// 							menuPath: ['Variables'],
// 							editorType: EditorType.XML,
// 							addNode: ({ factory }) => {
// 								return new VariableNode({ factory: __factory, variableId: v.id });
// 							}
// 						})
// 					);
// 				}

// 				spawnMoonMenu({
// 					items: [...variables, ...newMoonItems],
// 					searchbar: true,
// 					pos: { x: context.data.event.clientX, y: context.data.event.clientY }
// 				});
// 				moonMenuFactoryStore.set(__factory);
// 			}
// 			return context;
// 		});

// 		// area.use(contextMenu);
// 	}
// }

export type NodeMenuItem<N extends Node = Node> = {
	/** Label of the node. */
	label: string;
	/** Function that creates the node. */
	create: () => N;
	/** Menu path of the node. */
	path: string[];
	/** Search tags of the node. */
	tags: string[];
	/** Description of the node. */
	description: string;
};
export type ShowContextMenu = (params: {
	pos: Position;
	items: MenuItem[];
	searchbar: boolean;
}) => void;
export function contextMenuSetup({ showContextMenu }: { showContextMenu: ShowContextMenu }): Setup {
	return {
		name: 'Context Menu',
		type: 'area',
		setup: ({ area, factory, editor }) => {
			const baseNodeMenuItems: NodeMenuItem[] = [];
			for (const [id, nodeClass] of nodeRegistry.entries()) {
				if (nodeClass.visible !== undefined && !nodeClass.visible) continue;
				const pieces = id.split('.').map(capitalizeWords);

				/** Name of node in id. */
				const idName = pieces.at(-1)!;

				// Autogenerate menu path from id if unspecified
				if (nodeClass.path === undefined) {
					const path = pieces.slice(0, -1);
					nodeClass.path = path;
				}

				const node = new nodeClass();
				baseNodeMenuItems.push({
					label: node.label === undefined || node.label.trim() === '' ? idName : node.label,
					create: () => new nodeClass({ factory }),
					path: nodeClass.path,
					tags: nodeClass.tags ?? [],
					description: nodeClass.description ?? ''
				});
			}
			let lastSelectedNodes: SelectorEntity[] = [];
			area.addPipe((context) => {
				// React to pointerdown and contextmenu events only
				if (!(['contextmenu', 'pointerdown'] as (typeof context.type)[]).includes(context.type)) {
					return context;
				}

				const selector = factory.selector;
				if (!selector) {
					console.error('Selector not available on factory');
					return context;
				}
				// Something about node selection, TODO: check what it actually does
				if (context.type === 'pointerdown') {
					const event = context.data.event;
					const nodeDiv =
						event.target instanceof HTMLElement
							? event.target.classList.contains('node')
								? event.target
								: event.target.closest('.node')
							: null;
					if (
						event.target instanceof HTMLElement &&
						event.button === 2 &&
						(event.target.classList.contains('node') || event.target.closest('.node')) !== null
					) {
						const entries = Array(...area.nodeViews.entries());

						const nodeId = entries.find((t) => t[1].element === nodeDiv?.parentElement)?.[0];
						if (!nodeId) return context;
						factory.selectableNodes?.select(nodeId, true);
						const selectedNodes = wu(selector.entities.values())
							.filter((t) => editor.getNode(t.id) !== undefined)
							.toArray();
						// console.log('remember selected', selectedNodes);
						if (selectedNodes.length > 0) {
							lastSelectedNodes = selectedNodes;
						}
					}
				}

				// Handle context menu events
				if (context.type === 'contextmenu') {
					// Context menu on node
					if (context.data.context !== 'root') {
						if (!(context.data.context instanceof Node)) return context;
						console.debug('Context menu on node');
						context.data.event.preventDefault();
						context.data.event.stopImmediatePropagation();
						return;
					}
					// Context menu on editor
					context.data.event.preventDefault();
					console.debug('Context menu on editor');
					const variables: NodeMenuItem[] = [];
					for (const v of Object.values(get(editor.variables))) {
						// variables.push(
						// 	createNodeMenuItem({
						// 		label: v.name,
						// 		outTypes: [v.type],
						// 		menuPath: ['Variables'],
						// 		editorType: EditorType.XML,
						// 		addNode: ({}) => {
						// 			return new VariableNode({ factory, variableId: v.id });
						// 		}
						// 	})
						// );
					}

					const items: MenuItem[] = [];
					const pos: Position = { x: context.data.event.clientX, y: context.data.event.clientY };
					for (const nodeItem of baseNodeMenuItems) {
						items.push({
							...nodeItem,
							async action() {
								const node = nodeItem.create();
								await editor.addNode(node);
								const localPos = clientToSurfacePos({ pos, factory });
								await area.translate(node.id, localPos);
							}
						});
					}
					// Spawn context menu
					showContextMenu({
						items,
						pos,
						searchbar: true
					});
					// spawnMoonMenu({
					// 	items: [...variables, ...baseMenuItems],
					// 	searchbar: true,
					// 	pos: { x: context.data.event.clientX, y: context.data.event.clientY }
					// });
					// moonMenuFactoryStore.set(__factory);
				}
				return context;
			});
		}
	};
}