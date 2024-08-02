import puppeteer from 'puppeteer-core';
// Or import puppeteer from 'puppeteer-core';
const TIMEOUT = 1;

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", headless: true});
    const page = await browser.newPage();
  
    const CHECKED = 1,
        UNCHECKED = 0;
    // 9 pages for check
    const checked = [UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED];
    //await page.screenshot({path: 'screenshot.png'});
    page.on('console', async (message) => {
            console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`);
            if (message.text().includes("start started")) {
                console.log("looks like navigation page works, continue testing");
                // page loads, start testing
                const firstUnchecked = checked.findIndex((item) => item === UNCHECKED);
                console.log(firstUnchecked);
                if (firstUnchecked === -1) {
                    console.log("all test successfully done, closing");
                    await page.removeAllListeners();
                    await page.close();
                    await browser.close();
                    return;
                }
                switch (firstUnchecked) {
                    case 0:
                        setTimeout(async() => {
                            console.log("nav to dungeon");
                            checked[0] = CHECKED;
                            await page.mouse.click(527, 419); // click first menu item
                        }, TIMEOUT);
                        break;
                    case 1: 
                        setTimeout(async() => {
                            console.log("nav to pirates");
                            checked[1] = CHECKED;
                            await page.mouse.click(527, 453); // click first menu item
                        }, TIMEOUT);
                        break;
                    case 2: 
                        setTimeout(async() => {
                            checked[2] = CHECKED;
                            await page.mouse.click(527, 482); // click first menu item
                        }, TIMEOUT);
                        break;
                    case 3: 
                        setTimeout(async() => {
                            checked[3] = CHECKED;
                            await page.mouse.click(527, 510); // click first menu item
                        }, TIMEOUT);
                        break;
                    case 4: 
                        setTimeout(async() => {
                            checked[4] = CHECKED;
                            await page.mouse.click(527, 540);
                        }, TIMEOUT);
                        break;
                    case 5: 
                        setTimeout(async() => {
                            checked[5] = CHECKED;
                            await page.mouse.click(527, 570);
                        }, TIMEOUT);
                        break;
                    case 6: 
                        setTimeout(async() => {
                            checked[6] = CHECKED;
                            await page.mouse.click(527, 600);
                        }, TIMEOUT);
                        break;
                    case 7: 
                        setTimeout(async() => {
                            checked[7] = CHECKED;
                            await page.mouse.click(527, 630);
                        }, TIMEOUT);
                        break;
                    case 8: 
                        setTimeout(async() => {
                            checked[8] = CHECKED;
                            await page.mouse.click(527, 660);
                        }, TIMEOUT);
                        break;
                    case 9: 
                        setTimeout(async() => {
                            checked[9] = CHECKED;
                            await page.mouse.click(527, 690);
                        }, TIMEOUT);
                        break;
                    default:
                        console.log("no more check");
                        break;
                }
                // page.screenshot({path: 'screenshot1.png'});
                // 906/22
            }
            if (message.text().includes("dungeon started")) {
                console.log("looks like dungeon page works, continue testing");
                // page loads, start testing
                setTimeout(async() => {
                    await page.mouse.click(906, 22); // click first menu item
                }, TIMEOUT);
                
                // page.screenshot({path: 'screenshot1.png'});
                // 906/22
            }
            
            if (message.text().includes("pirates started")) {
                console.log("looks like pirates page works, continue testing");
                // page loads, start testing
                setTimeout(async() => {
                    await page.mouse.click(906, 22); // click first menu item
                }, TIMEOUT);
                // page.screenshot({path: 'screenshot1.png'});
                // 906/22
            }
            if (message.text().includes("racing started")) {
                console.log("looks like racing page works, continue testing");
                // page loads, start testing
                setTimeout(async() => {
                    await page.mouse.click(906, 22); // click first menu item
                }, TIMEOUT);
            }
            if (message.text().includes("spine started")) {
                console.log("looks like spine page works, continue testing");
                // page loads, start testing
                setTimeout(async() => {
                    await page.mouse.click(906, 22); // click first menu item
                }, TIMEOUT);
            }
            if (message.text().includes("big_map started")) {
                console.log("looks like big_map page works, continue testing");
                // page loads, start testing
                setTimeout(async() => {
                    await page.mouse.click(906, 22); // click first menu item
                }, TIMEOUT);
            }
            if (message.text().includes("strategy started")) {
                console.log("looks like strategy page works, continue testing");
                // page loads, start testing
                setTimeout(async() => {
                    await page.mouse.click(906, 54); // click first menu item
                }, TIMEOUT);
            }
            if (message.text().includes("custom_webgl started")) {
                console.log("looks like custom webgl page works, continue testing");
                // page loads, start testing
                setTimeout(async() => {
                    await page.mouse.click(906, 22); // click first menu item
                }, TIMEOUT);
            }
            if (message.text().includes("tanks started")) {
                console.log("looks like tanks page works, continue testing");
                // page loads, start testing
                setTimeout(async() => {
                    await page.mouse.click(906, 22); // click first menu item
                }, TIMEOUT);
            }
            if (message.text().includes("primitives started")) {
                console.log("looks like primitives page works, continue testing");
                // page loads, start testing
                setTimeout(async() => {
                    await page.mouse.click(906, 22); // click first menu item
                }, TIMEOUT);
            }
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
            console.log(`${request.failure().errorText} ${request.url()}`)
        });
    
    // Navigate the page to a URL
    await page.goto('http://127.0.0.1:9000/examples/');
  
    // Set screen size
    await page.setViewport({width: 1080, height: 1024});
    
    await page.locator("button").click();

  })();