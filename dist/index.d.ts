/// <reference types="node" />
import { Chart as ChartJS, ChartComponentLike, ChartConfiguration } from 'chart.js';
import { ExportFormat } from 'skia-canvas';
export declare type ChartJSSkiaCanvasPlugins = {
    /**
     * Global plugins, see https://www.chartjs.org/docs/latest/developers/plugins.html.
     */
    readonly modern?: ReadonlyArray<string | ChartComponentLike>;
    /**
     * This will work for plugins that `require` ChartJS themselves.
     */
    readonly requireChartJSLegacy?: ReadonlyArray<string>;
    /**
     * This should work for any plugin that expects a global Chart variable.
     */
    readonly globalVariableLegacy?: ReadonlyArray<string>;
    /**
     * This will work with plugins that just return a plugin object and do no specific loading themselves.
     */
    readonly requireLegacy?: ReadonlyArray<string>;
};
export declare type ChartCallback = (chartJS: typeof ChartJS) => void | Promise<void>;
export interface ChartJSSkiaCanvasOptions {
    /**
     * The width of the charts to render, in pixels.
     */
    readonly width: number;
    /**
     * The height of the charts to render, in pixels.
     */
    readonly height: number;
    /**
     * Optional callback which is called once with a new ChartJS global reference as the only parameter.
     */
    readonly chartCallback?: ChartCallback;
    /**
     * Optional plugins to register.
     */
    readonly plugins?: ChartJSSkiaCanvasPlugins;
    /**
     * Optional background color for the chart, otherwise it will be transparent. Note, this will apply to all charts. See the [fillStyle](https://www.w3schools.com/tags/canvas_fillstyle.asp) canvas API used for possible values.
     */
    readonly backgroundColour?: string;
}
export declare class ChartJSSkiaCanvas {
    private readonly _width;
    private readonly _height;
    private readonly _chartJs;
    /**
     * Create a new instance of CanvasRenderService.
     *
     * @param options Configuration for this instance
     */
    constructor(options: ChartJSSkiaCanvasOptions);
    /**
     * Render to a data url.
     * @param configuration The Chart JS configuration for the chart to render.
     * @param mimeType The image format
     */
    renderToDataURL(configuration: ChartConfiguration, mimeType?: ExportFormat): Promise<string>;
    /**
     * Render to a buffer.
     * @param configuration The Chart JS configuration for the chart to render.
     * @param mimeType The image format
     */
    renderToBuffer(configuration: ChartConfiguration, mimeType?: ExportFormat): Promise<Buffer>;
    private initialize;
    private renderChart;
}
