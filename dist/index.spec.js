"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mocha_1 = require("mocha");
const ts_std_lib_1 = require("ts-std-lib");
const _1 = require("./");
const assert = new ts_std_lib_1.Assert();
(0, mocha_1.describe)(_1.ChartJSSkiaCanvas.name, () => {
    // const chartColors = {
    // 	red: 'rgb(255, 99, 132)',
    // 	orange: 'rgb(255, 159, 64)',
    // 	yellow: 'rgb(255, 205, 86)',
    // 	green: 'rgb(75, 192, 192)',
    // 	blue: 'rgb(54, 162, 235)',
    // 	purple: 'rgb(153, 102, 255)',
    // 	grey: 'rgb(201, 203, 207)'
    // };
    const width = 400;
    const height = 400;
    const configuration = {
        type: 'bar',
        data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                    label: '# of Votes',
                    data: [12, 19, 3, 5, 2, 3],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(255, 206, 86, 0.2)',
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgba(255,99,132,1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)'
                    ],
                    borderWidth: 1
                }]
        },
        options: {
            scales: {
                yAxes: {
                    ticks: {
                        beginAtZero: true,
                        callback: (value) => '$' + value
                    }
                }
            }
        },
        plugins: {
            annotation: {}
        }
    };
    function createSUT(plugins) {
        const chartCallback = (ChartJS) => {
            ChartJS.defaults.responsive = true;
            ChartJS.defaults.maintainAspectRatio = false;
        };
        return new _1.ChartJSSkiaCanvas({ width, height, chartCallback, plugins });
    }
    const mimeTypes = ['png', 'jpeg'];
    (0, mocha_1.describe)(_1.ChartJSSkiaCanvas.prototype.renderToDataURL.name, () => {
        (0, mocha_1.describe)(`given canvasType 'undefined'`, () => {
            const canvasType = undefined;
            mimeTypes.forEach((mimeType) => {
                (0, mocha_1.describe)(`given mimeType '${mimeType}'`, () => {
                    (0, mocha_1.it)('renders data url', async () => {
                        const chartJSNodeCanvas = createSUT(canvasType);
                        const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration, mimeType);
                        assert.equal(dataUrl.startsWith(`data:${mimeType};base64,`), true);
                    });
                    (0, mocha_1.it)('renders data url in parallel', async () => {
                        const chartJSNodeCanvas = createSUT(canvasType);
                        const promises = Array(3).fill(undefined).map(() => chartJSNodeCanvas.renderToDataURL(configuration, mimeType));
                        const dataUrls = await Promise.all(promises);
                        dataUrls.forEach((dataUrl) => assert.equal(dataUrl.startsWith(`data:${mimeType};base64,`), true));
                    });
                });
            });
        });
    });
    (0, mocha_1.describe)(_1.ChartJSSkiaCanvas.prototype.renderToBuffer.name, () => {
        (0, mocha_1.describe)(`given canvasType 'undefined'`, () => {
            const canvasType = undefined;
            mimeTypes.forEach((mimeType) => {
                (0, mocha_1.describe)(`given extended mimeType '${mimeType}'`, () => {
                    (0, mocha_1.it)('renders chart', async () => {
                        const chartJSNodeCanvas = createSUT(canvasType);
                        const image = await chartJSNodeCanvas.renderToBuffer(configuration, mimeType);
                        assert.equal(image instanceof Buffer, true);
                    });
                });
            });
        });
    });
});
//# sourceMappingURL=index.spec.js.map