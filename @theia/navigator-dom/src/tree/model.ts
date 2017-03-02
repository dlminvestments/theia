import {Event, Disposable} from "@theia/platform-common";

/**
 * The tree model.
 */
export interface ITreeModel extends Disposable {
    /**
     * Root nodes.
     */
    readonly roots: ReadonlyArray<ITreeNode>;
    /**
     * Emit when the tree is changed.
     */
    readonly onChanged: Event<void>;
    /**
     * Return a valid node in this tree matching to the given; otherwise undefined.
     */
    validateNode(node: ITreeNode | undefined): ITreeNode | undefined;
    /**
     * Refresh children of the given node.
     * If the given node is undefined then root nodes are refreshed.
     */
    refresh(parent?: Readonly<ICompositeTreeNode>): void;
    /**
     * Emit when the children of the give node are refreshed.
     * If the given node is undefined then root nodes are refreshed.
     */
    readonly onNodeRefreshed: Event<Readonly<ICompositeTreeNode> | undefined>;
    /**
     * The tree selection service.
     * Undefined if this tree does not support selection of nodes.
     */
    readonly selection?: ITreeSelectionService;
    /**
     * The tree expansion service.
     * Undefined if this tree does not support expansion of nodes.
     */
    readonly expansion?: ITreeExpansionService;
}

/**
 * The tree node.
 */
export interface ITreeNode {
    /**
     * An id of this node.
     * If undefined then name should be used as an id.
     */
    readonly id?: string;
    /**
     * A human-readable name of this tree node.
     */
    readonly name: string;
    /**
     * A parent node of this tree node.
     * Undefined if this node is root.
     */
    readonly parent: Readonly<ICompositeTreeNode> | undefined;
}

export namespace ITreeNode {
    export function getId(node: ITreeNode | undefined): string | undefined {
        return !!node ? node.id || node.name : undefined;
    }

    export function equals(left: ITreeNode | undefined, right: ITreeNode | undefined): boolean {
        return left === right || getId(left) === getId(right);
    }
}

/**
 * The composite tree node.
 */
export interface ICompositeTreeNode extends ITreeNode {
    /**
     * Child nodes of this tree node.
     */
    children: ReadonlyArray<ITreeNode>;
}

export namespace ICompositeTreeNode {
    export function is(node: ITreeNode | undefined): node is ICompositeTreeNode {
        return !!node && 'children' in node;
    }
}

/**
 * Selection API for the tree model.
 */
export interface ITreeSelectionService {
    /**
     * The node selected in the tree. If defined then valid.
     * Undefined if there is no node selection.
     */
    readonly selectedNode: Readonly<ISelectableTreeNode> | undefined;
    /**
     * Emit when the node selection is changed.
     */
    readonly onSelectionChanged: Event<Readonly<ISelectableTreeNode> | undefined>;
    /**
     * Select a given node.
     * If a given node is undefined or invalid then remove the node selection.
     */
    selectNode(node: Readonly<ISelectableTreeNode> | undefined): void;
}

/**
 * The selectable tree node.
 */
export interface ISelectableTreeNode extends ITreeNode {
    /**
     * Test whether this node is selected.
     */
    selected: boolean;
}

export namespace ISelectableTreeNode {
    export function is(node: ITreeNode | undefined): node is ISelectableTreeNode {
        return !!node && 'selected' in node;
    }
}

/**
 * Expansion API for the tree model.
 */
export interface ITreeExpansionService {
    /**
     * Emit when the node is expanded or collapsed.
     */
    readonly onExpansionChanged: Event<Readonly<IExpandableTreeNode>>;
    /**
     * If the given node is valid and collapsed then expand it.
     * Expanding a node refreshes all its children.
     */
    expandNode(node: Readonly<IExpandableTreeNode>): void;
    /**
     * If the given node is valid and expanded then collapse it.
     *
     * If the selected node belongs to the given
     * then the given is selected on collapsing.
     */
    collapseNode(node: Readonly<IExpandableTreeNode>): void;
    /**
     * If the given node is invalid then does nothing.
     * If the given node is collapsed then expand it; otherwise collapse it.
     */
    toggleNodeExpansion(node: Readonly<IExpandableTreeNode>): void;
}

/**
 * The expandable tree node.
 */
export interface IExpandableTreeNode extends ICompositeTreeNode {
    /**
     * Test whether this tree node is expanded.
     */
    expanded: boolean;
}

export namespace IExpandableTreeNode {
    export function is(node: ITreeNode | undefined): node is IExpandableTreeNode {
        return !!node && ICompositeTreeNode.is(node) && 'expanded' in node;
    }

    export function getChildren(node: ICompositeTreeNode | undefined): ReadonlyArray<ITreeNode> {
        if (!node) {
            return [];
        }
        if (IExpandableTreeNode.is(node)) {
            return node.expanded ? node.children : [];
        }
        return node.children;
    }
}
