import type { NodeFactory } from '../$graph-editor/editor';
import { SolverAPINode } from './SolverAPINode';

export class ExecuteNode extends SolverAPINode {
	constructor({ factory }: { factory: NodeFactory }) {
		super({ label: 'Execute Solver', url: '/execute', factory, height: 280 });
		this.oldAddInData({
			name: 'time',
			displayName: 'Time',
			socketLabel: 'Time',
			type: 'number',
			control: {
				type: 'number',
				options: {
					initial: 0,
					label: 'Time'
				}
			}
		});
		this.pythonComponent.addCode('$(solver).execute($(time))');
	}
}
