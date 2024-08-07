import type { Socket } from '../../socket/Socket.svelte';
import { Node } from '$graph-editor/nodes/Node.svelte';
import type { NodeFactory } from '$graph-editor/editor';
import type { XmlData } from './types';

export class GetNameNode extends Node<{ xml: Socket }, { name: Socket }> {
	constructor({ factory }: { factory: NodeFactory }) {
		super({ label: 'Get Name', factory });
		this.oldAddInData({
			name: 'xml',
			displayName: 'XML',
			socketLabel: 'XML',
			type: 'xmlElement:*'
		});
		this.oldAddOutData({
			name: 'name',
			displayName: 'Name',
			socketLabel: 'Name',
			type: 'groupNameRef'
		});
	}

	override data(inputs?: Record<string, unknown>): { name: string } {
		const xml = this.getData('xml', inputs) as XmlData;

		return { name: xml?.name };
	}
}
