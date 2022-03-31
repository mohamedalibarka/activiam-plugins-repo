import React, { useRef } from 'react';
import useComponentSize from '@rehooks/component-size';
import {
    DataVisualizationWidgetState,
    withQueryResult,
    CellSetSelection,
    axisIds,
} from '@activeviam/activeui-sdk';
import Plot from 'react-plotly.js';
import Spin from 'antd/lib/spin';
import {
    addToSunburst,
    ClickData,
    putInTree,
    sunburstPointToCellSetSelection,
    TreeNode,
} from './sunburst.helper';

export const Sunburst = withQueryResult<
    DataVisualizationWidgetState,
    CellSetSelection
>((props) => {
    const geoLayoutRef = useRef<Plotly.Layout['geo'] | undefined>({});
    const container = useRef<HTMLDivElement>(null);
    let { height, width } = useComponentSize(container);
    const { data, error, isLoading } = props.queryResult;
    if (isLoading || !data) {
        return <Spin />;
    }

    if (error) {
        return <div>{error.stackTrace}</div>;
    }

    // console.log("Sunburst",isLoading, data);
    if (data.axes.length < 2) {
        return <Spin />;
    }
    const { onSelectionChange } = props;

    const handleHover = (payload: { points: ClickData[] }) => {
        console.log(payload.points[0].id);
        const newSelection = sunburstPointToCellSetSelection(
            data,
            payload.points[0],
            axisIds
        );
        if (newSelection && !!onSelectionChange)
            onSelectionChange(newSelection);
    };

    const sunburstAxes = data.axes[0].positions;
    const sunburstData = data.axes[1].positions;
    const sunburstValues = data.cells;

    const title = data.axes[0].positions[0][0].namePath[0];
    const plots = [];
    let percentage = 100;
    if (sunburstAxes.length > 5) {
        height /= 2;
        width /= 3;
        percentage = 50;
    }

    for (
        let subplotNumber = 0;
        subplotNumber < sunburstAxes.length;
        subplotNumber++
    ) {
        // console.log("Subplot number : ", subplotNumber)
        const subtitle =
            sunburstAxes[subplotNumber][0].namePath[
                sunburstAxes[subplotNumber][0].namePath.length - 1
            ];
        const ids: Array<any> = [];
        const labels: Array<any> = [];
        const parents: Array<any> = [];
        const values: Array<any> = [];

        const levels = data.axes[1].hierarchies.length;

        const tree: TreeNode = {
            name: subtitle,
            value: 0,
            children: [],
            parent: '',
            path: '',
        };
        sunburstData.map((position, rowIndex) => {
            const path: Array<string> = [];
            for (let i = 0; i < levels; i++) {
                path.push(position[i].captionPath.join('-'));
            }
            putInTree(
                tree,
                path,
                sunburstValues[rowIndex * sunburstAxes.length + subplotNumber]
                    .value
            );
        });

        tree.children.forEach((node) => {
            tree.value += node.value;
        });

        addToSunburst(tree, parents, labels, values, ids);
        //console.log(tree, parents, labels ,values, ids)
        const plot = (
            <div
                style={{
                    height: { percentage } + '%',
                    width: { percentage } + '%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                }}
            >
                <div
                    className="subplotTitle"
                    style={{
                        textAlignLast: 'center',
                    }}
                >
                    {subtitle}
                </div>
                <Plot
                    divId="my-div"
                    //onHover={handleHover}
                    data={[
                        {
                            type: 'sunburst',
                            labels: labels,
                            parents: parents,
                            values: values,
                            ids: ids,
                            marker: {
                                line: {
                                    width: 2,
                                },
                            },
                            branchvalues: 'total',
                        },
                    ]}
                    layout={{
                        // clickmode: "select",
                        // dragmode: "lasso",
                        geo: geoLayoutRef.current,
                        height,
                        width,
                        margin: {
                            l: 0,
                            r: 0,
                            b: 0,
                            t: 0,
                        },
                    }}
                ></Plot>
            </div>
        );

        plots.push(plot);
    }

    return (
        <div
            ref={container}
            tabIndex={0}
            style={{
                ...props.style,
                height: '95%',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-evenly',
            }}
        >
            {plots}
        </div>
    );
});
