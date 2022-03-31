import React, { useRef } from 'react';
import useComponentSize from '@rehooks/component-size';
import {
    DataVisualizationWidgetState,
    withQueryResult,
    CellSetSelection,
} from '@activeviam/activeui-sdk';
import Plot from 'react-plotly.js';
import Spin from 'antd/lib/spin';
import { generateHeatmapData } from './heatmap.helper';

export const Heatmap = withQueryResult<
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

    if (data.axes.length < 2) {
        return <Spin />;
    }

    const heatmapAxes = data.axes[0].positions;

    const plots = [];
    let percentage = 100;
    if (heatmapAxes.length > 5) {
        height /= 2;
        width /= 3;
        percentage = 50;
    }

    for (
        let subplotNumber = 0;
        subplotNumber < heatmapAxes.length;
        subplotNumber++
    ) {
        const subtitle =
            heatmapAxes[subplotNumber][0].namePath[
                heatmapAxes[subplotNumber][0].namePath.length - 1
            ];

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
                    data={generateHeatmapData(data, subplotNumber)}
                    layout={{
                        geo: geoLayoutRef.current,
                        height,
                        width,
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
                height: '100%',
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-evenly',
            }}
        >
            {plots}
        </div>
    );
});
