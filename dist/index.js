"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartJSSkiaCanvas = void 0;
const skia_canvas_1 = require("skia-canvas");
const backgroundColourPlugin_1 = require("./backgroundColourPlugin");
const freshRequire_1 = require("./freshRequire");
class ChartJSSkiaCanvas {
    /**
     * Create a new instance of CanvasRenderService.
     *
     * @param options Configuration for this instance
     */
    constructor(options) {
        if (options === null || typeof (options) !== 'object') {
            throw new Error('An options parameter object is required');
        }
        if (!options.width || typeof (options.width) !== 'number') {
            throw new Error('A width option is required');
        }
        if (!options.height || typeof (options.height) !== 'number') {
            throw new Error('A height option is required');
        }
        this._width = options.width;
        this._height = options.height;
        this._chartJs = this.initialize(options);
    }
    /**
     * Render to a data url.
     * @param configuration The Chart JS configuration for the chart to render.
     * @param mimeType The image format
     */
    async renderToDataURL(configuration, mimeType = 'png') {
        const chart = this.renderChart(configuration);
        if (!chart.canvas)
            throw new Error('Canvas is null');
        const canvas = chart.canvas;
        const png = await canvas.toDataURL(mimeType);
        chart.destroy();
        return png;
    }
    /**
     * Render to a buffer.
     * @param configuration The Chart JS configuration for the chart to render.
     * @param mimeType The image format
     */
    async renderToBuffer(configuration, mimeType = 'png') {
        const chart = this.renderChart(configuration);
        if (!chart.canvas)
            throw new Error('Canvas is null');
        const canvas = chart.canvas;
        const buffer = await canvas.toBuffer(mimeType);
        chart.destroy();
        return buffer;
    }
    initialize(options) {
        var _a, _b, _c, _d;
        const chartJs = require('chart.js');
        if ((_a = options.plugins) === null || _a === void 0 ? void 0 : _a.requireChartJSLegacy) {
            for (const plugin of options.plugins.requireChartJSLegacy) {
                require(plugin);
                delete require.cache[require.resolve(plugin)];
            }
        }
        if ((_b = options.plugins) === null || _b === void 0 ? void 0 : _b.globalVariableLegacy) {
            global.Chart = chartJs;
            for (const plugin of options.plugins.globalVariableLegacy) {
                (0, freshRequire_1.freshRequire)(plugin);
            }
            delete global.Chart;
        }
        if ((_c = options.plugins) === null || _c === void 0 ? void 0 : _c.modern) {
            for (const plugin of options.plugins.modern) {
                if (typeof plugin === 'string') {
                    chartJs.register((0, freshRequire_1.freshRequire)(plugin));
                }
                else {
                    chartJs.register(plugin);
                }
            }
        }
        if ((_d = options.plugins) === null || _d === void 0 ? void 0 : _d.requireLegacy) {
            for (const plugin of options.plugins.requireLegacy) {
                chartJs.register((0, freshRequire_1.freshRequire)(plugin));
            }
        }
        if (options.chartCallback) {
            options.chartCallback(chartJs);
        }
        if (options.backgroundColour) {
            chartJs.register(new backgroundColourPlugin_1.BackgroundColourPlugin(options.width, options.height, options.backgroundColour));
        }
        delete require.cache[require.resolve('chart.js')];
        return chartJs;
    }
    renderChart(configuration) {
        const canvas = new skia_canvas_1.Canvas(this._width, this._height);
        canvas.style = canvas.style || {};
        // Disable animation (otherwise charts will throw exceptions)
        configuration.options = configuration.options || {};
        configuration.options.responsive = false;
        configuration.options.animation = false;
        const context = canvas.getContext('2d');
        global.Image = skia_canvas_1.Image; // Some plugins use this API
        const chart = new this._chartJs(context, configuration);
        delete global.Image;
        return chart;
    }
}
exports.ChartJSSkiaCanvas = ChartJSSkiaCanvas;
//# sourceMappingURL=index.js.map