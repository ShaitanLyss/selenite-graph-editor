import type { NodeFactory } from '../$graph-editor/editor';
import { SolverAPINode } from './SolverAPINode';

export class UpdateSourcesAndReceiversNode extends SolverAPINode {
	constructor({ factory }: { factory: NodeFactory }) {
		super({
			label: 'Update Sources and Receivers',
			url: '/update_sources_receivers',
			factory,
			height: 300,
			width: 180
		});

		this.oldAddInData({
			name: 'sourceCoords',
			displayName: 'Source Coords',
			socketLabel: 'Sources Coords',
			type: 'pythonObject'
		});
		this.oldAddInData({
			name: 'receiverCoords',
			displayName: 'Receiver Coords',
			socketLabel: 'Receivers Coords',
			type: 'pythonObject'
		});

		this.pythonComponent.addCode(
			'$(solver).updateSourceAndReceivers($(sourceCoords), $(receiverCoords))'
		);
	}
}
