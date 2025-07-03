import puppeteer from 'puppeteer';
// Or import puppeteer from 'puppeteer-core';

// Delay before running tests after page loads
const TIMEOUT = 50;

(async () => {
    // Launch browser with specific settings for consistent rendering
    const browser = await puppeteer.launch({
        /*executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",*/
        headless: "shell",
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu' // Ensures consistent pixel colors across headless modes
        ]
    });
    const page = await browser.newPage();

    // Constants for tracking test completion
    const CHECKED = 1,
        UNCHECKED = 0;

    // Array to track which of the 9 test pages have been completed
    const checked = Array(9).fill(UNCHECKED);

    // Expose function to browser context for pixel color validation
    await page.exposeFunction('isColorsMatch', (pixels, colorName) => {
        // Color reference table for expected pixel values in different test scenarios
        const colors = {
            GREY: {
                R: 72,
                G: 72,
                B: 72,
                A: 92
            },
            DARK_BROWN: {
                R: 55,
                G: 14,
                B: 11,
                A: 255
            },
            LIGHT_BROWN: {
                R: 234,
                G: 165,
                B: 108,
                A: 255
            },
            GRASS_GREEN: {
                R: 46,
                G: 204,
                B: 113,
                A: 255
            },
            WATER_BLUE: {
                R: 176,
                G: 233,
                B: 252,
                A: 255

            },
            SAND_BROWN: {
                R: 187,
                G: 128,
                B: 68,
                A: 255
            },
            ROAD_GREY: {
                R: 166,
                G: 201,
                B: 203,
                A: 255
            },
            GOBLIN_GREEN: {
                R: 93,
                G: 101,
                B: 61,
                A: 255
            },
            SPEAR_GREY: {
                R: 132, //131,
                G: 134, //133,
                B: 138, //137,
                A: 255
            },
            HIDDEN_BROWN: {
                R: 61,
                G: 49,
                B: 50,
                A: 255
            },
            VISIBLE_BROWN: {
                R: 125,
                G: 112,
                B: 113,
                A: 255
            },
            GROUND_GREEN: {
                R: 177, // 195, // 177
                G: 211, // 214, // 211
                B: 84, // 87,  // 84
                A: 255
            },
            DEEP_WATER_BLUE: {
                R: 66,
                G: 172,
                B: 175,
                A: 255
            },
            TANK_BLUE: {
                R: 59,
                G: 146,
                B: 203,
                A: 255
            },
            ROAD_BROWN: {
                R: 184,
                G: 150,
                B: 104,
                A: 255
            },
            TRIANGLE_PURPLE: {
                R: 130,
                G: 30,
                B: 130,
                A: 255
            },
            CIRCLE_GREEN: {
                R: 0,
                G: 64,
                B: 0,
                A: 64
            }
        };

        // Compare pixel RGBA values with expected color
        return pixels[0] === colors[colorName].R &&
            pixels[1] === colors[colorName].G &&
            pixels[2] === colors[colorName].B &&
            pixels[3] === colors[colorName].A
    });

    // Listen for console messages from the browser to trigger test actions
    page.on('console', async (message) => {
        console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`);

        // Add delay before processing console messages
        setTimeout(async() => {
            // Initial page load - validate start screen and begin testing
            if (message.text().includes("start started")) {
                const canvasHandle = await page.$('canvas');
                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");

                    // Read pixel data from canvas
                    const pixels = new Uint8Array(1 * 1 * 4);
                    gl.readPixels(50, 50, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                    // Validate expected grey pixel on start screen
                    const isMatch = await isColorsMatch(pixels, "GREY");

                    if (isMatch === false) {
                        throw new Error("Start page pixels doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                // Find next unchecked test and navigate to it
                const firstUnchecked = checked.findIndex((item) => item === UNCHECKED);

                if (firstUnchecked === -1) {
                    console.log("all test successfully done, closing");
                    await page.removeAllListeners();
                    await page.close();
                    await browser.close();
                    return;
                }

                // Navigate to specific test pages by clicking menu items
                switch (firstUnchecked) {
                    case 0:
                        console.log("nav to dungeon");
                        await page.mouse.click(527, 419); // Click first menu item
                        break;
                    case 1:
                        console.log("nav to pirates");
                        await page.mouse.click(527, 453);
                        break;
                    case 2:
                        console.log("nav to racing");
                        await page.mouse.click(527, 482);
                        break;
                    case 3:
                        console.log("nav to spine");
                        await page.mouse.click(527, 510);
                        break;
                    case 4:
                        console.log("nav to strategy");
                        await page.mouse.click(527, 540);
                        break;
                    case 5:
                        console.log("nav to big map");
                        await page.mouse.click(527, 570);
                        break;
                    case 6:
                        console.log("nav to custom webgl");
                        await page.mouse.click(527, 600);
                        break;
                    case 7:
                        console.log("nav to tanks");
                        await page.mouse.click(527, 630);
                        break;
                    case 8:
                        console.log("nav to primitives draw");
                        await page.mouse.click(527, 660);
                        break;
                    default:
                        console.log("no more check");
                        break;
                }
            }

            // Test dungeon page - validate dark and light brown pixels
            if (message.text().includes("dungeon started")) {
                checked[0] = CHECKED;
                const canvasHandle = await page.$('canvas');
                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");

                    const pixels = new Uint8Array(1 * 1 * 4);

                    // Check dark brown pixel
                    gl.readPixels(100, 100, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch = await isColorsMatch(pixels, "DARK_BROWN");

                    if (isMatch === false) {
                        throw new Error("Dungeon page pixels doesn't match, pixels: " + pixels);
                    }

                    // Check light brown pixel
                    gl.readPixels(80, 758, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch2 = await isColorsMatch(pixels, "LIGHT_BROWN");

                    if (isMatch2 === false) {
                        throw new Error("Dungeon page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                await page.mouse.click(906, 22); // Click back button
            }

            // Test pirates page - validate grass green and water blue pixels
            if (message.text().includes("pirates started")) {
                checked[1] = CHECKED;
                const canvasHandle = await page.$('canvas');

                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");

                    const pixels = new Uint8Array(1 * 1 * 4);

                    // Check grass green pixel
                    gl.readPixels(90, 942, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch = await isColorsMatch(pixels, "GRASS_GREEN");

                    if (isMatch === false) {
                        throw new Error("Pirates page pixels doesn't match, pixels: " + pixels);
                    }

                    // Check water blue pixel
                    gl.readPixels(90, 720, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch2 = await isColorsMatch(pixels, "WATER_BLUE");

                    if (isMatch2 === false) {
                        throw new Error("Pirates page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                await page.mouse.click(906, 22); // Click back button
            }

            // Test racing page - validate sand brown and road grey pixels
            if (message.text().includes("racing started")) {
                checked[2] = CHECKED;
                const canvasHandle = await page.$('canvas');

                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");

                    const pixels = new Uint8Array(1 * 1 * 4);

                    // Check sand brown pixel
                    gl.readPixels(10, 1000, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch = await isColorsMatch(pixels, "SAND_BROWN");

                    if (isMatch === false) {
                        throw new Error("Racing page pixels doesn't match, pixels: " + pixels);
                    }

                    // Check road grey pixel
                    gl.readPixels(90, 600, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch2 = await isColorsMatch(pixels, "ROAD_GREY");

                    if (isMatch2 === false) {
                        throw new Error("Racing page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                await page.mouse.click(906, 22); // Click back button
            }

            // Test spine animation page - validate goblin green and spear grey pixels
            if (message.text().includes("spine started")) {
                checked[3] = CHECKED;
                const canvasHandle = await page.$('canvas');

                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");

                    const pixels = new Uint8Array(1 * 1 * 4);

                    // Check goblin green pixel
                    gl.readPixels(526, 348, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch = await isColorsMatch(pixels, "GOBLIN_GREEN");

                    if (isMatch === false) {
                        throw new Error("Spine page pixels doesn't match, pixels: " + pixels);
                    }

                    // Check spear grey pixel
                    gl.readPixels(654, 514, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch2 = await isColorsMatch(pixels, "SPEAR_GREY");

                    if (isMatch2 === false) {
                        throw new Error("Spine page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                await page.mouse.click(906, 22); // Click back button
            }

            // Test strategy page - validate ground green and deep water blue pixels
            if (message.text().includes("strategy started")) {
                checked[4] = CHECKED;
                const canvasHandle = await page.$('canvas');

                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");

                    const pixels = new Uint8Array(1 * 1 * 4);

                    // Check ground green pixel
                    gl.readPixels(192, 716, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch = await isColorsMatch(pixels, "GROUND_GREEN");

                    if (isMatch === false) {
                        throw new Error("Strategy page pixels doesn't match, pixels: " + pixels);
                    }

                    // Check deep water blue pixel
                    gl.readPixels(210, 296, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch2 = await isColorsMatch(pixels, "DEEP_WATER_BLUE");

                    if (isMatch2 === false) {
                        throw new Error("Strategy page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                await page.mouse.click(906, 54); // Click back button (different position)
            }

            // Test big map page - validate hidden and visible brown pixels
            if (message.text().includes("big_map started")) {
                checked[5] = CHECKED;
                const canvasHandle = await page.$('canvas');

                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");

                    const pixels = new Uint8Array(1 * 1 * 4);

                    // Check hidden brown pixel
                    gl.readPixels(24, 982, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch = await isColorsMatch(pixels, "HIDDEN_BROWN");

                    if (isMatch === false) {
                        throw new Error("Big map page pixels doesn't match, pixels: " + pixels);
                    }

                    // Check visible brown pixel
                    gl.readPixels(146, 766, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch2 = await isColorsMatch(pixels, "VISIBLE_BROWN");

                    if (isMatch2 === false) {
                        throw new Error("Big map page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                await page.mouse.click(906, 22); // Click back button
            }

            // Test custom WebGL page - no pixel validation needed
            if (message.text().includes("custom_webgl started")) {
                checked[6] = CHECKED;
                await page.mouse.click(906, 22); // Click back button
            }

            // Test tanks page - validate tank blue and road brown pixels
            if (message.text().includes("tanks started")) {
                checked[7] = CHECKED;
                const canvasHandle = await page.$('canvas');
                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");

                    const pixels = new Uint8Array(1 * 1 * 4);

                    // Check tank blue pixel
                    gl.readPixels(90, 714, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch = await isColorsMatch(pixels, "TANK_BLUE");

                    if (isMatch === false) {
                        throw new Error("Tanks page pixels doesn't match, pixels: " + pixels);
                    }

                    // Check road brown pixel
                    gl.readPixels(268, 526, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch2 = await isColorsMatch(pixels, "ROAD_BROWN");

                    if (isMatch2 === false) {
                        throw new Error("Tanks page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                await page.mouse.click(906, 22); // Click back button
            }

            // Test primitives page - validate triangle purple and circle green pixels
            if (message.text().includes("primitives started")) {
                checked[8] = CHECKED;
                const canvasHandle = await page.$('canvas');
                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");

                    const pixels = new Uint8Array(1 * 1 * 4);

                    // Check triangle purple pixel
                    gl.readPixels(144, 890, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch = await isColorsMatch(pixels, "TRIANGLE_PURPLE");

                    if (isMatch === false) {
                        throw new Error("Primitives page pixels doesn't match, pixels: " + pixels);
                    }

                    // Check circle green pixel
                    gl.readPixels(380, 634, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                    const isMatch2 = await isColorsMatch(pixels, "CIRCLE_GREEN");

                    if (isMatch2 === false) {
                        throw new Error("Primitives page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                await page.mouse.click(906, 22); // Click back button
            }
        }, TIMEOUT);
    })
        // Error handling for page errors
        .on('pageerror', async({ message }) => {
            console.error("error on page ---> ", checked.findIndex((item) => item === UNCHECKED));
            console.error(message);
            await browser.close();
        })
        // Log HTTP responses
        .on('response', async(response) => {
            console.log("response --->");
            console.log(`${response.status()} ${response.url()}`);
        })
        // Log failed requests
        .on('requestfailed', async(request) => {
            console.log("failed --->");
            console.log(`${request.failure().errorText} ${request.url()}`);
        });

    // Navigate to the test page
    await page.goto('http://127.0.0.1:9000/examples/');

    // Set browser viewport size
    await page.setViewport({width: 1080, height: 1024});

    // Enable preserveDrawingBuffer for WebGL pixel reading
    const preserveDrawingBufferCheckbox = await page.$("#preserveDrawingBuffer");
    preserveDrawingBufferCheckbox.click();

    // Start the test suite
    await page.locator("button").click();

})();