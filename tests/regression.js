import puppeteer from 'puppeteer';
// Or import puppeteer from 'puppeteer-core';
const TIMEOUT = 1;

(async () => {
    // Launch the browser and open a new blank page
    const browser = await puppeteer.launch({/*executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",*/ headless: "shell", args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']});
    const page = await browser.newPage();
  
    const CHECKED = 1,
        UNCHECKED = 0;
    // 9 pages for check
    const checked = [UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED, UNCHECKED];
    //await page.screenshot({path: 'screenshot.png'});
    page.on('console', async (message) => {
        console.log(`${message.type().substr(0, 3).toUpperCase()} ${message.text()}`);
        setTimeout(async() => {
            if (message.text().includes("start started")) {
                console.log("looks like navigation page works, continue testing");
                // page loads, start testing
                const firstUnchecked = checked.findIndex((item) => item === UNCHECKED);
                console.log(firstUnchecked);
                if (firstUnchecked === -1) {
                    console.log("all test successfully done, closing");
                    await page.removeAllListeners();
                    //await page.close();
                    await browser.close();
                    return;
                }
                switch (firstUnchecked) {
                    case 0:
                        checked[0] = CHECKED;
                            await page.mouse.click(527, 419);
                        break;
                    case 1: 
                        checked[1] = CHECKED;
                        await page.mouse.click(527, 453);
                        break;
                    case 2: 
                        checked[2] = CHECKED;
                        await page.mouse.click(527, 482);
                        break;
                    case 3: 
                        checked[3] = CHECKED;
                        await page.mouse.click(527, 510);
                        break;
                    case 4: 
                        checked[4] = CHECKED;
                        await page.mouse.click(527, 540);
                        break;
                    case 5: 
                        checked[5] = CHECKED;
                        await page.mouse.click(527, 570);
                        break;
                    case 6: 
                        checked[6] = CHECKED;
                        await page.mouse.click(527, 600);
                        break;
                    case 7: 
                        checked[7] = CHECKED;
                        await page.mouse.click(527, 630);
                        break;
                    case 8: 
                        checked[8] = CHECKED;
                        await page.mouse.click(527, 660);
                        break;
                    case 9: 
                        checked[9] = CHECKED;
                        await page.mouse.click(527, 690);
                        break;
                    default:
                        console.log("no more check");
                        break;
                }
                // page.screenshot({path: 'screenshot1.png'});
                // 906/22
            }
            if (message.text().includes("dungeon started")) {
                
                await page.mouse.click(906, 22);
            }
            
            if (message.text().includes("pirates started")) {
                await page.mouse.click(906, 22);
            }
            if (message.text().includes("racing started")) {
                
                await page.mouse.click(906, 22);
            }
            if (message.text().includes("spine started")) {
                
                await page.mouse.click(906, 22);
            }
            if (message.text().includes("big_map started")) {
                
                await page.mouse.click(906, 22);
            }
            if (message.text().includes("strategy started")) {
                // page loads, start testing
                await page.mouse.click(906, 54);
            }
            if (message.text().includes("custom_webgl started")) {
                console.log("looks like custom webgl page works, continue testing");
                // page loads, start testing
                await page.mouse.click(906, 22); // click first menu item
            }
            if (message.text().includes("tanks started")) {
                console.log("looks like tanks page works, continue testing");
                // page loads, start testing
                await page.mouse.click(906, 22); // click first menu item
            }
            if (message.text().includes("primitives started")) {
                console.log("looks like primitives page works, continue testing");
                // page loads, start testing
                await page.mouse.click(906, 22); // click first menu item
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
    
    await page.locator("button").click();

  })();