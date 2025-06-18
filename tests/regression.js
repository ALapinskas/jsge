import puppeteer from 'puppeteer';
// Or import puppeteer from 'puppeteer-core';
const TIMEOUT = 50;

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({
        /*executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",*/ 
        headless: "shell", 
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox', 
            '--disable-gpu' // without this option, pixels colors(spine test 2) for headless: true and headless: "shell" are a bit different
        ]
    });
    const page = await browser.newPage();
  
    const CHECKED = 1,
        UNCHECKED = 0;
    // 9 pages for check
    const checked = Array(9).fill(UNCHECKED);
    //await page.screenshot({path: 'screenshot.png'});
    await page.exposeFunction('isColorsMatch', (pixels, colorName) => {
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

        return pixels[0] === colors[colorName].R && 
                pixels[1] === colors[colorName].G &&
                pixels[2] === colors[colorName].B &&
                pixels[3] === colors[colorName].A
   });
    
    page.on('console', async (message) => {
        console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`);
        setTimeout(async() => {
            if (message.text().includes("start started")) {
                const canvasHandle = await page.$('canvas');
                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");
                    
                    const pixels = new Uint8Array(
                        1 * 1 * 4,
                    );
                    gl.readPixels(
                        50,
                        50,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    
                    const isMatch = await isColorsMatch(pixels, "GREY");
                    
                    if (isMatch === false) {
                        throw new Error("Start page pixels doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);
                
                // page loads, start testing
                const firstUnchecked = checked.findIndex((item) => item === UNCHECKED);
                
                if (firstUnchecked === -1) {
                    console.log("all test successfully done, closing");
                    await page.removeAllListeners();
                    await page.close();
                    await browser.close();
                    return;
                }
                switch (firstUnchecked) {
                    case 0:
                        console.log("nav to dungeon");
                        await page.mouse.click(527, 419); // click first menu item
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
                // page.screenshot({path: 'screenshot1.png'});
                // 906/22
            }
            if (message.text().includes("dungeon started")) {
                checked[0] = CHECKED;
                // page loads, start testing
                const canvasHandle = await page.$('canvas');
                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");
                    
                    const pixels = new Uint8Array(
                        1 * 1 * 4,
                    );
                    gl.readPixels(
                        100,
                        100,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    
                    const isMatch = await isColorsMatch(pixels, "DARK_BROWN");
                    
                    if (isMatch === false) {
                        throw new Error("Dungeon page pixels doesn't match, pixels: " + pixels);
                    }
                    gl.readPixels(
                        80,
                        758,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );

                    const isMatch2 = await isColorsMatch(pixels, "LIGHT_BROWN");
                    
                    if (isMatch2 === false) {
                        throw new Error("Dungeon page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);
                //page.screenshot({path: 'screenshot1.png'});
                await page.mouse.click(906, 22);
                // 906/22
            }
            
            if (message.text().includes("pirates started")) {
                checked[1] = CHECKED;
                // page loads, start testing
                const canvasHandle = await page.$('canvas');

                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");
                    
                    const pixels = new Uint8Array(
                        1 * 1 * 4,
                    );
                    gl.readPixels(
                        90,
                        942,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch = await isColorsMatch(pixels, "GRASS_GREEN");
                    
                    if (isMatch === false) {
                        throw new Error("Pirates page pixels doesn't match, pixels: " + pixels);
                    }
                    
                    gl.readPixels(
                        90,
                        720,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    
                    const isMatch2 = await isColorsMatch(pixels, "WATER_BLUE");
                    
                    if (isMatch2 === false) {
                        throw new Error("Pirates page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);
                
                //page.screenshot({path: 'screenshot2.png'});
                await page.mouse.click(906, 22);
                // 906/22
            }
            if (message.text().includes("racing started")) {
                checked[2] = CHECKED;
                // page loads, start testing
                const canvasHandle = await page.$('canvas');

                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");
                    
                    const pixels = new Uint8Array(
                        1 * 1 * 4,
                    );
                    gl.readPixels(
                        10,
                        1000,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch = await isColorsMatch(pixels, "SAND_BROWN");
                    
                    if (isMatch === false) {
                        throw new Error("Racing page pixels doesn't match, pixels: " + pixels);
                    }
                    
                    gl.readPixels(
                        90,
                        600,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    
                    const isMatch2 = await isColorsMatch(pixels, "ROAD_GREY");
                
                    if (isMatch2 === false) {
                        throw new Error("Racing page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);
                
                await page.mouse.click(906, 22);
            }
            if (message.text().includes("spine started")) {
                checked[3] = CHECKED;
                
                // page loads, start testing
                const canvasHandle = await page.$('canvas');

                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");
                    
                    const pixels = new Uint8Array(
                        1 * 1 * 4,
                    );
                    gl.readPixels(
                        526,
                        348,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch = await isColorsMatch(pixels, "GOBLIN_GREEN");
                    
                    if (isMatch === false) {
                        throw new Error("Spine page pixels doesn't match, pixels: " + pixels);
                    }
                    
                    gl.readPixels(
                        654,
                        514,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch2 = await isColorsMatch(pixels, "SPEAR_GREY");
                
                    if (isMatch2 === false) {
                        throw new Error("Spine page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);
                //page.screenshot({path: 'screenshot4.png'});

                await page.mouse.click(906, 22);
            }
            if (message.text().includes("strategy started")) {
                checked[4] = CHECKED;
                // page loads, start testing
                const canvasHandle = await page.$('canvas');
                //page.screenshot({path: 'screenshot6.png'});
                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");
                    
                    const pixels = new Uint8Array(
                        1 * 1 * 4,
                    );
                    gl.readPixels(
                        192,
                        716,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch = await isColorsMatch(pixels, "GROUND_GREEN");
                    
                    if (isMatch === false) {
                        throw new Error("Strategy page pixels doesn't match, pixels: " + pixels);
                    }
                    
                    gl.readPixels(
                        210,
                        296,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch2 = await isColorsMatch(pixels, "DEEP_WATER_BLUE");
                    
                    if (isMatch2 === false) {
                        throw new Error("Strategy page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);
                
                await page.mouse.click(906, 54);
            }
            if (message.text().includes("big_map started")) {
                checked[5] = CHECKED;
                // page loads, start testing
                const canvasHandle = await page.$('canvas');

                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");
                    
                    const pixels = new Uint8Array(
                        1 * 1 * 4,
                    );
                    gl.readPixels(
                        24,
                        982,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch = await isColorsMatch(pixels, "HIDDEN_BROWN");
                    //
                    if (isMatch === false) {
                        throw new Error("Big map page pixels doesn't match, pixels: " + pixels);
                    }
                    
                    gl.readPixels(
                        146,
                        766,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch2 = await isColorsMatch(pixels, "VISIBLE_BROWN");
                
                    if (isMatch2 === false) {
                        throw new Error("Big map page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);
                //page.screenshot({path: 'screenshot5.png'});

                await page.mouse.click(906, 22);
            }
            
            if (message.text().includes("custom_webgl started")) {
                checked[6] = CHECKED;
                // page loads, start testing
        
                await page.mouse.click(906, 22);
            }
            if (message.text().includes("tanks started")) {
                checked[7] = CHECKED;
                // page loads, start testing
                const canvasHandle = await page.$('canvas');
                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");
                    
                    const pixels = new Uint8Array(
                        1 * 1 * 4,
                    );
                    gl.readPixels(
                        90,
                        714,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch = await isColorsMatch(pixels, "TANK_BLUE");
                    
                    if (isMatch === false) {
                        throw new Error("Tanks page pixels doesn't match, pixels: " + pixels);
                    }
                    gl.readPixels(
                        268,
                        526,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    //console.log(pixels);
                    const isMatch2 = await isColorsMatch(pixels, "ROAD_BROWN");
                    
                    if (isMatch2 === false) {
                        throw new Error("Tanks page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);
                
                await page.mouse.click(906, 22);
            }
            if (message.text().includes("primitives started")) {
                checked[8] = CHECKED;
                // page loads, start testing
                const canvasHandle = await page.$('canvas');
                const html = await page.evaluate(async (canvas) => {
                    const gl = canvas.getContext("webgl");
                    
                    const pixels = new Uint8Array(
                        1 * 1 * 4,
                    );
                    gl.readPixels(
                        144,
                        890,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    
                    const isMatch = await isColorsMatch(pixels, "TRIANGLE_PURPLE");
                    
                    if (isMatch === false) {
                        throw new Error("Primitives page pixels doesn't match, pixels: " + pixels);
                    }
                    gl.readPixels(
                        380,
                        634,
                        1,
                        1,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        pixels,
                    );
                    
                    const isMatch2 = await isColorsMatch(pixels, "CIRCLE_GREEN");
                    
                    if (isMatch2 === false) {
                        throw new Error("Tanks page pixels 2 doesn't match, pixels: " + pixels);
                    }
                }, canvasHandle);

                await page.mouse.click(906, 22);
            }
        }, TIMEOUT);
    })
    .on('pageerror', async({ message }) => {
        console.error("error on page ---> ", checked.findIndex((item) => item === UNCHECKED));
        console.error(message);
        await browser.close();
    }).on('response', async(response) => {
        console.log("response --->");
        console.log(`${response.status()} ${response.url()}`);
    }).on('requestfailed', async(request) => {
        console.log("failed --->");
        console.log(`${request.failure().errorText} ${request.url()}`);
    });
    
    // Navigate the page to a URL
    await page.goto('http://127.0.0.1:9000/examples/');
  
    // Set screen size
    await page.setViewport({width: 1080, height: 1024});

    const preserveDrawingBufferCheckbox = await page.$("#preserveDrawingBuffer");
    preserveDrawingBufferCheckbox.click();
    
    await page.locator("button").click();

  })();