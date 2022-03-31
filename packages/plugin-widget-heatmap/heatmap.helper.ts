import { CellSet } from '@activeviam/activeui-sdk';
import { Data } from 'plotly.js';

const generateHeatmapData = (data: CellSet, subplotNb: number): Data[] => {
    const heatmapData = data.axes[1].positions;
    const heatmapValues = data.cells;

    const xLabels = [];
    const yLabels = [];

    for (const d of heatmapData) {
        if (d.length !== 2) continue;
        const x = d[0].captionPath[d[0].captionPath.length - 1]; // only keep last element of captionPath ?
        const y = d[1].captionPath[d[1].captionPath.length - 1]; // only keep last element of captionPath ?
        if (xLabels.indexOf(x) === -1) {
            xLabels.push(x);
        }
        if (yLabels.indexOf(y) === -1) {
            yLabels.push(y);
        }
    }

    const values: (number | null)[][] = [];

    for (const y of yLabels) {
        const xValues: (number | null)[] = [];
        for (const x of xLabels) {
            let ordinal = -1;
            for (const [i, d] of heatmapData.entries()) {
                if (
                    d[0].captionPath[d[0].captionPath.length - 1] === x &&
                    d[1].captionPath[d[1].captionPath.length - 1] === y
                ) {
                    ordinal = i;
                }
            }
            if (ordinal !== -1) {
                xValues.push(
                    heatmapValues.filter((h) => h.ordinal === ordinal)[
                        subplotNb
                    ].value as number
                ); // Does subplot work like this ?
            } else {
                xValues.push(null);
            }
        }
        values.push(xValues);
    }

    return [{ x: xLabels, y: yLabels, z: values, type: 'heatmap' }];
};

export { generateHeatmapData };
