"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert_1 = require("assert");
const fs_1 = require("fs");
const mocha_1 = require("mocha");
const os_1 = require("os");
const path_1 = require("path");
const resemblejs_1 = (0, tslib_1.__importDefault)(require("resemblejs"));
const lib_1 = require("skia-canvas/lib");
const _1 = require("./");
(0, mocha_1.describe)(_1.ChartJSSkiaCanvas.name, () => {
    const chartColors = {
        red: 'rgb(255, 99, 132)',
        orange: 'rgb(255, 159, 64)',
        yellow: 'rgb(255, 205, 86)',
        green: 'rgb(75, 192, 192)',
        blue: 'rgb(54, 162, 235)',
        purple: 'rgb(153, 102, 255)',
        grey: 'rgb(201, 203, 207)'
    };
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
                    beginAtZero: true,
                    ticks: {
                        callback: (tickValue, _index, _ticks) => '$' + tickValue
                    }
                }
            },
            plugins: {
                annotation: {}
            }
        }
    };
    const chartCallback = (ChartJS) => {
        ChartJS.defaults.responsive = true;
        ChartJS.defaults.maintainAspectRatio = false;
    };
    (0, mocha_1.it)('works with render to buffer', async () => {
        const chartJSNodeCanvas = new _1.ChartJSSkiaCanvas({ width, height, chartCallback, backgroundColour: 'white' });
        const actual = await chartJSNodeCanvas.renderToBuffer(configuration);
        await assertImage(actual, 'render-to-buffer');
    });
    (0, mocha_1.it)('works with render to data url', async () => {
        const chartJSNodeCanvas = new _1.ChartJSSkiaCanvas({ width, height, chartCallback, backgroundColour: 'white' });
        const actual = await chartJSNodeCanvas.renderToDataURL(configuration);
        const extension = '.txt';
        const fileName = 'render-to-data-URL';
        const fileNameWithExtension = fileName + extension;
        const expectedDataPath = (0, path_1.join)(process.cwd(), 'testData', (0, os_1.platform)(), fileName + extension);
        const expected = await fs_1.promises.readFile(expectedDataPath, 'utf8');
        // const result = actual === expected;
        const compareData = await compareImages(actual, expected, { output: { useCrossOrigin: false } });
        const misMatchPercentage = Number(compareData.misMatchPercentage);
        const result = misMatchPercentage > 0;
        if (result) {
            const actualDataPath = expectedDataPath.replace(fileNameWithExtension, fileName + '-actual' + extension);
            await fs_1.promises.writeFile(actualDataPath, actual);
            const compare = `<div>Actual:</div>${os_1.EOL}<img src="${actual}">${os_1.EOL}<div>Expected:</div><img src="${expected}">`;
            const compareDataPath = expectedDataPath.replace(fileNameWithExtension, fileName + '-compare.html');
            await fs_1.promises.writeFile(compareDataPath, compare);
            const diffPng = compareData.getBuffer();
            await writeDiff(expectedDataPath.replace(fileNameWithExtension, fileName + '-diff' + extension), diffPng);
            throw new assert_1.AssertionError({
                message: `Expected data urls to match, mismatch was ${misMatchPercentage}%${os_1.EOL}See '${compareDataPath}'`,
                actual: actualDataPath,
                expected: expectedDataPath,
            });
        }
    });
    (0, mocha_1.it)('works with registering plugin', async () => {
        const chartJSNodeCanvas = new _1.ChartJSSkiaCanvas({
            width, height, backgroundColour: 'white', plugins: {
                modern: ['chartjs-plugin-annotation']
            }
        });
        const actual = await chartJSNodeCanvas.renderToBuffer({
            type: 'bar',
            data: {
                labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
                datasets: [
                    {
                        type: 'line',
                        label: 'Dataset 1',
                        borderColor: chartColors.blue,
                        borderWidth: 2,
                        fill: false,
                        data: [-39, 44, -22, -45, -27, 12, 18]
                    },
                    {
                        type: 'bar',
                        label: 'Dataset 2',
                        backgroundColor: chartColors.red,
                        data: [-18, -43, 36, -37, 1, -1, 26],
                        borderColor: 'white',
                        borderWidth: 2
                    },
                    {
                        type: 'bar',
                        label: 'Dataset 3',
                        backgroundColor: chartColors.green,
                        data: [-7, 21, 1, 7, 34, -29, -36]
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    annotation: {
                        annotations: [
                            {
                                drawTime: 'afterDatasetsDraw',
                                id: 'hline',
                                type: 'line',
                                mode: 'horizontal',
                                scaleID: 'y-axis-0',
                                value: 48,
                                borderColor: 'black',
                                borderWidth: 5,
                                label: {
                                    backgroundColor: 'red',
                                    content: 'Test Label',
                                    enabled: true
                                }
                            },
                            {
                                drawTime: 'beforeDatasetsDraw',
                                type: 'box',
                                xScaleID: 'x-axis-0',
                                yScaleID: 'y-axis-0',
                                xMin: 'February',
                                xMax: 'April',
                                yMin: -23,
                                yMax: 40,
                                backgroundColor: 'rgba(101, 33, 171, 0.5)',
                                borderColor: 'rgb(101, 33, 171)',
                                borderWidth: 1,
                            }
                        ]
                    }
                }
            }
        });
        await assertImage(actual, 'chartjs-plugin-annotation');
    });
    (0, mocha_1.it)('works with self registering plugin', async () => {
        const chartJSNodeCanvas = new _1.ChartJSSkiaCanvas({
            width, height, backgroundColour: 'white', plugins: {
                requireLegacy: [
                    'chartjs-plugin-datalabels'
                ]
            }
        });
        const actual = await chartJSNodeCanvas.renderToBuffer({
            type: 'bar',
            data: {
                labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                datasets: [{
                        backgroundColor: chartColors.red,
                        data: [12, 19, 3, 5, 2, 3],
                        datalabels: {
                            align: 'end',
                            anchor: 'start'
                        }
                    }, {
                        backgroundColor: chartColors.blue,
                        data: [3, 5, 2, 3, 30, 15, 19, 2],
                        datalabels: {
                            align: 'center',
                            anchor: 'center'
                        }
                    }, {
                        backgroundColor: chartColors.green,
                        data: [12, 19, 3, 5, 2, 3],
                        datalabels: {
                            anchor: 'end',
                            align: 'start',
                        }
                    }]
            },
            options: {
                plugins: {
                    datalabels: {
                        color: 'white',
                        display(context) {
                            return context.dataset.data[context.dataIndex] > 15;
                        },
                        font: {
                            weight: 'bold'
                        },
                        formatter: Math.round
                    }
                },
                scales: {
                    xAxes: {
                        stacked: true
                    },
                    yAxes: {
                        stacked: true
                    }
                }
            }
        });
        await assertImage(actual, 'chartjs-plugin-datalabels');
    });
    // it.skip('works with global variable plugin', async () => {
    // 	const chartJSNodeCanvas = new ChartJSNodeCanvas({
    // 		width, height, backgroundColour: 'white', plugins: {
    // 			globalVariableLegacy: [
    // 				'chartjs-plugin-crosshair'
    // 			]
    // 		}
    // 	});
    // 	const actual = await chartJSNodeCanvas.renderToBuffer({
    // 	});
    // 	await assertImage(actual, 'chartjs-plugin-funnel');
    // });
    (0, mocha_1.it)('works with custom font', async () => {
        const chartJSNodeCanvas = new _1.ChartJSSkiaCanvas({
            width, height, backgroundColour: 'white', chartCallback: (ChartJS) => {
                ChartJS.defaults.font.family = 'VTKS UNAMOUR';
            }
        });
        lib_1.FontLibrary.use("VTKS UNAMOUR", './testData/VTKS UNAMOUR.ttf');
        const actual = await chartJSNodeCanvas.renderToBuffer({
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
                        borderWidth: 1,
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
        });
        await assertImage(actual, 'font');
    });
    (0, mocha_1.it)('works without background color', async () => {
        const chartJSNodeCanvas = new _1.ChartJSSkiaCanvas({ width, height, chartCallback });
        const actual = await chartJSNodeCanvas.renderToBuffer(configuration);
        await assertImage(actual, 'no-background-color');
    });
    // TODO: Replace node-memwatch with a new lib!
    /*
    it('does not leak with new instance', async () => {

        const diffs = await Promise.all([...Array(4).keys()].map((iteration) => {
            const heapDiff = new memwatch.HeapDiff();
            console.log('generated heap for iteration ' + (iteration + 1));
            const ChartJSNodeCanvas = new ChartJSNodeCanvas(width, height, chartCallback);
            return ChartJSNodeCanvas.renderToBuffer(configuration, 'image/png')
                .then(() => {
                    const diff = heapDiff.end();
                    console.log('generated diff for iteration ' + (iteration + 1));
                    return diff;
                });
        }));
        const actual = diffs.map(d => d.change.size_bytes);
        const expected = actual.slice().sort();
        assert.notDeepEqual(actual, expected);
    });

    it('does not leak with same instance', async () => {

        const ChartJSNodeCanvas = new ChartJSNodeCanvas(width, height, chartCallback);
        const diffs = await Promise.all([...Array(4).keys()].map((iteration) => {
            const heapDiff = new memwatch.HeapDiff();
            console.log('generated heap for iteration ' + (iteration + 1));
            return ChartJSNodeCanvas.renderToBuffer(configuration, 'image/png')
                .then(() => {
                    const diff = heapDiff.end();
                    console.log('generated diff for iteration ' + (iteration + 1));
                    return diff;
                });
        }));
        const actual = diffs.map(d => d.change.size_bytes);
        const expected = actual.slice().sort();
        assert.notDeepEqual(actual, expected);
    });
    */
    /*
    function hashCode(string: string): number {

        let hash = 0;
        if (string.length === 0) {
            return hash;
        }
        for (let i = 0; i < string.length; i++) {
            const chr = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
    */
    async function assertImage(actual, fileName) {
        const extension = '.png';
        const fileNameWithExtension = fileName + extension;
        const testDataPath = (0, path_1.join)(process.cwd(), 'testData', (0, os_1.platform)(), fileNameWithExtension);
        const exists = await pathExists(testDataPath);
        if (!exists) {
            console.error(`Warning: expected image path does not exist!, creating '${testDataPath}'`);
            await fs_1.promises.writeFile(testDataPath, actual, 'base64');
            return;
        }
        const expected = await fs_1.promises.readFile(testDataPath);
        const compareData = await compareImages(actual, expected);
        // const compareData = await new Promise<ResembleComparisonResult>((resolve) => {
        // 	const diff = resemble(actual)
        // 		.compareTo(expected)
        // 		.onComplete((data) => {
        // 			resolve(data);
        // 		});
        // });
        const misMatchPercentage = Number(compareData.misMatchPercentage);
        // const result = actual.equals(expected);
        const result = misMatchPercentage > 0;
        // const actual = hashCode(image.toString('base64'));
        // const expected = -1377895140;
        // assert.equal(actual, expected);
        if (result) {
            await fs_1.promises.writeFile(testDataPath.replace(fileNameWithExtension, fileName + '-actual' + extension), actual);
            const diffPng = compareData.getBuffer();
            await writeDiff(testDataPath.replace(fileNameWithExtension, fileName + '-diff' + extension), diffPng);
            throw new assert_1.AssertionError({
                message: `Expected image to match '${testDataPath}', mismatch was ${misMatchPercentage}%'`,
                // actual: JSON.stringify(actual),
                // expected: JSON.stringify(expected),
                operator: 'to equal',
                stackStartFn: assertImage,
            });
        }
    }
    // resemblejs/compareImages
    //function compareImages(image1: string | Buffer, image2: string | Buffer, options?: ResembleSingleCallbackComparisonOptions): Promise<ResembleSingleCallbackComparisonResult> {
    function compareImages(image1, image2, options) {
        return new Promise((resolve, reject) => {
            //resemble.compare(image1, image2, options || {}, (err, data) => {
            resemblejs_1.default.compare(image1, image2, options || {}, (err, data) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(data);
                }
            });
        });
    }
    function writeDiff(filepath, png) {
        return new Promise((resolve, reject) => {
            if (Buffer.isBuffer(png)) {
                fs_1.promises.writeFile(filepath, png.toString('base64'), 'base64')
                    .then(() => resolve())
                    .catch(reject);
                return;
            }
            const chunks = [];
            png.on('data', (chunk) => {
                chunks.push(chunk);
            });
            png.on('end', () => {
                const buffer = Buffer.concat(chunks);
                fs_1.promises.writeFile(filepath, buffer.toString('base64'), 'base64')
                    .then(() => resolve())
                    .catch(reject);
            });
            png.on('error', (err) => reject(err));
        });
    }
    function pathExists(path) {
        return fs_1.promises.access(path).then(() => true).catch(() => false);
    }
});
//# sourceMappingURL=index.e2e.spec.js.map