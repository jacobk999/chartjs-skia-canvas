import { Chart as ChartJS, ChartComponentLike, ChartConfiguration } from 'chart.js';
import { Canvas, ExportFormat, Image } from 'skia-canvas';
import { BackgroundColourPlugin } from './backgroundColourPlugin';
import { freshRequire } from './freshRequire';

export type ChartJSSkiaCanvasPlugins = {
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
export type ChartCallback = (chartJS: typeof ChartJS) => void | Promise<void>;

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

export class ChartJSSkiaCanvas {

	private readonly _width: number;
	private readonly _height: number;
	private readonly _chartJs: typeof ChartJS;

	/**
	 * Create a new instance of CanvasRenderService.
	 *
	 * @param options Configuration for this instance
	 */
	constructor(options: ChartJSSkiaCanvasOptions) {

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
	public async renderToDataURL(configuration: ChartConfiguration, mimeType: ExportFormat = 'png'): Promise<string> {

		const chart = this.renderChart(configuration);
		if (!chart.canvas)
			throw new Error('Canvas is null');

		const canvas = chart.canvas as unknown as Canvas;
		const png = await canvas.toDataURL(mimeType);
		chart.destroy();
		return png;
	}

	/**
	 * Render to a buffer.
	 * @param configuration The Chart JS configuration for the chart to render.
	 * @param mimeType The image format
	 */
	public async renderToBuffer(configuration: ChartConfiguration, mimeType: ExportFormat = 'png'): Promise<Buffer> {

		const chart = this.renderChart(configuration);

		if (!chart.canvas)
			throw new Error('Canvas is null');

		const canvas = chart.canvas as unknown as Canvas;
		const buffer = await canvas.toBuffer(mimeType);
		chart.destroy();
		return buffer;
	}

	private initialize(options: ChartJSSkiaCanvasOptions): typeof ChartJS {

		const chartJs: typeof ChartJS = require('chart.js');

		if (options.plugins?.requireChartJSLegacy) {
			for (const plugin of options.plugins.requireChartJSLegacy) {
				require(plugin);
				delete require.cache[require.resolve(plugin)];
			}
		}

		if (options.plugins?.globalVariableLegacy) {
			(global as any).Chart = chartJs;
			for (const plugin of options.plugins.globalVariableLegacy) {
				freshRequire(plugin);
			}
			delete (global as any).Chart;
		}

		if (options.plugins?.modern) {
			for (const plugin of options.plugins.modern) {
				if (typeof plugin === 'string') {
					chartJs.register(freshRequire(plugin));
				} else {
					chartJs.register(plugin);
				}
			}
		}

		if (options.plugins?.requireLegacy) {
			for (const plugin of options.plugins.requireLegacy) {
				chartJs.register(freshRequire(plugin));
			}
		}

		if (options.chartCallback) {
			options.chartCallback(chartJs);
		}

		if (options.backgroundColour) {
			chartJs.register(new BackgroundColourPlugin(options.width, options.height, options.backgroundColour));
		}

		delete require.cache[require.resolve('chart.js')];

		return chartJs;
	}

	private renderChart(configuration: ChartConfiguration): ChartJS {

		const canvas = new Canvas(this._width, this._height);
		(canvas as any).style = (canvas as any).style || {};
		// Disable animation (otherwise charts will throw exceptions)
		configuration.options = configuration.options || {};
		configuration.options.responsive = false;
		configuration.options.animation = false as any;
		const context = canvas.getContext('2d');

		(global as any).Image = Image; // Some plugins use this API
		const chart = new this._chartJs(context as unknown as CanvasRenderingContext2D, configuration);
		delete (global as any).Image;
		return chart;
	}
}
