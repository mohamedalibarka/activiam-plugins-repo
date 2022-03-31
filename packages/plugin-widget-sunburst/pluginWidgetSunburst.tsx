import {
    DataVisualizationContentEditor,
    DataVisualizationWidgetState,
    WidgetPlugin,
    FiltersEditor,
    parse,
    CellSetSelection,
} from '@activeviam/activeui-sdk';
import { Sunburst } from './Sunburst';
import { IconSunburst } from './IconSunburst';
const widgetKey = 'sunburst';
export const pluginWidgetSunburst: WidgetPlugin<
    DataVisualizationWidgetState,
    CellSetSelection
> = {
    Component: Sunburst,
    category: 'dataVisualization',
    contentEditor: DataVisualizationContentEditor,
    filtersEditor: FiltersEditor,
    Icon: IconSunburst,
    attributes: {
        values: {
            role: 'primaryNumeric',
            maxNumberOfFields: 1,
        },
        rows: {
            role: 'primaryOrdinal',
        },
        horizontalSubplots: {
            role: 'subplot',
            maxNumberOfFields: 1,
        },
    },
    initialState: {
        widgetKey,
        query: {
            mdx: parse(`SELECT
      NON EMPTY Crossjoin(
      Hierarchize(
          Descendants(
          {
              [Countries].[Country].[AllMember]
          },
          1,
          SELF_AND_BEFORE
          )
      ),
      [Green-growth].[Year].[Year].Members
      ) ON ROWS,
      NON EMPTY {
      [Measures].[Real GDP per capita (USD).MEAN]
      } ON COLUMNS
      FROM [Green-growth]
      CELL PROPERTIES VALUE, FORMATTED_VALUE, BACK_COLOR, FORE_COLOR, FONT_FLAGS
      `),
        },
        mapping: {
            values: [
                {
                    type: 'measure',
                    measureName: 'Real GDP per capita (USD).MEAN',
                },
            ],
            rows: [
                {
                    type: 'hierarchy',
                    levelName: 'Continent_Name',
                    hierarchyName: 'Country',
                    dimensionName: 'Countries',
                },
                {
                    type: 'hierarchy',
                    levelName: 'Year',
                    hierarchyName: 'Year',
                    dimensionName: 'Green-growth',
                },
            ],
            horizontalSubplots: [],
        },
    },
    key: widgetKey,
    translations: {
        'en-US': {
            key: 'Sunburst',
            defaultName: 'New Sunburst',
        },
    },
};
