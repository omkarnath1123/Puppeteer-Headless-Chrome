// const puppeteer = require('puppeteer');
//
// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://amazon.com');
//
//     // Get the "viewport" of the page, as reported by the page.
//     const dimensions = await page.evaluate(() => {
//         return {
//             width: document.documentElement.clientWidth,
//             height: document.documentElement.clientHeight,
//             deviceScaleFactor: window.devicePixelRatio
//         };
//     });
//
//     console.log('Dimensions:', dimensions);
//
//     await browser.close();
// })();

// const puppeteer = require('puppeteer');
//
// (async () => {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://https://github.com/GoogleChrome/puppeteer', {waitUntil: 'networkidle2'});
//     await page.pdf({path: 'hn.pdf', format: 'A4'});
//
//     await browser.close();
// })();

const puppeteer = require('puppeteer');

(async () => {
    // const browser = await puppeteer.launch();
    // const browser = await puppeteer.launch({headless: false});
    // const browser = await puppeteer.launch({executablePath: '/path/to/Chrome'});
    // const browser = await puppeteer.launch({});
    const browser = await puppeteer.launch({
        // executablePath : '/Applications/Google Chrome.app/',
        devtools: true,
        headless: false,
        slowMo: 1000 // slow down by 250ms
    });
    // page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    const page = await browser.newPage();
    await page.goto('https://flipkart.com');
    await page.screenshot({path: 'example.png'});
    // adds debugger to the every line source file
    await page.evaluate(() => {debugger;}); // chrome will stop in debug mode
    // create  fake untrusted event
    // await page.evaluate(() => {
    //     document.querySelector('button[type=submit]').click();
    // });
    await page.evaluate(() => console.log(`url is ${location.href}`));
    // await browser.close();
})();
