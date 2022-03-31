import {
    AxisId,
    CellSet,
    CellSetSelection,
    Member,
} from '@activeviam/activeui-sdk';

export interface ClickData {
    id?: string;
}

export interface TreeNode {
    name: string;
    value: number;
    children: Array<TreeNode>;
    parent: string;
    path: string;
}

const sunburstPointToCellSetSelection = (
    pluginData: CellSet,
    point: ClickData,
    axisIds: { [key: string]: AxisId }
): CellSetSelection | undefined => {
    const selection = point.id?.split('->').slice(1);
    console.log(pluginData);
    if (!pluginData || !selection) {
        return;
    }

    const rowsAxis = pluginData.axes[1];

    const matchingMembers = rowsAxis.positions.filter((members: Member[]) =>
        selection.every(
            (s, id) =>
                members[id].captionPath.length === s.split('-').length &&
                members[id].captionPath.every((x, i) => x === s.split('-')[i])
        )
    );

    if (matchingMembers.length === 0) return;

    const membersToFilter = matchingMembers[0];

    const selectedCountries: CellSetSelection = {
        axes: [
            {
                id: axisIds.rows,
                // si on veut que la selection soit porte seulement sur l'axe principal (racine) qu'on survole
                /*
                positions: membersToFilter.map((m, i) => [{
                    dimensionName: rowsAxis.hierarchies[i].dimension,
                    hierarchyName: rowsAxis.hierarchies[i].hierarchy,
                    ...m,
                }]).filter((_,i) => i === 0),
                */

                // si on veut que la selection porte seulement sur l'axe qu'on survole
                /*
                positions: membersToFilter
                    .map((m, i) => [
                        {
                            dimensionName: rowsAxis.hierarchies[i].dimension,
                            hierarchyName: rowsAxis.hierarchies[i].hierarchy,
                            ...m,
                        },
                    ])
                    .filter((_, i) => i === selection.length - 1),
                */
                // si on veut que la selection porte sur la combinaison de tous les axes parents + celui qu'on survole
                positions: membersToFilter
                    .map((m, i) => [
                        {
                            dimensionName: rowsAxis.hierarchies[i].dimension,
                            hierarchyName: rowsAxis.hierarchies[i].hierarchy,
                            ...m,
                        },
                    ])
                    .filter((_, i) => i < selection.length),
            },
        ],
    };
    return selectedCountries;
};

const addToSunburst = (
    tree: TreeNode,
    parents: Array<any>,
    labels: Array<any>,
    values: Array<any>,
    ids: Array<any>
) => {
    parents.push(tree.parent);
    labels.push(tree.name);
    values.push(tree.value);
    ids.push(tree.path);
    tree.children.forEach((node) =>
        addToSunburst(node, parents, labels, values, ids)
    );
};

const putInTree = (tree: TreeNode, path: Array<string>, value: any) => {
    const pathSplit = path[0].split('-');
    const treeName = pathSplit[pathSplit.length - 1];
    if (path.length > 1) {
        let foundIndex = tree.children.findIndex(
            (child) => child.name == treeName
        );
        if (foundIndex == -1) {
            foundIndex = tree.children.length;
            tree.children.push({
                name: treeName,
                value: 0,
                children: [],
                parent: tree.path,
                path: tree.path + '->' + path[0],
            });
        }
        const newPath = path.slice(1);
        tree.children[foundIndex].value += value;
        putInTree(tree.children[foundIndex], newPath, value);
    } else {
        tree.children.push({
            name: treeName,
            value: value,
            children: [],
            parent: tree.path,
            path: tree.path + '->' + path[0],
        });
    }
    return tree;
};

export { sunburstPointToCellSetSelection, addToSunburst, putInTree };
