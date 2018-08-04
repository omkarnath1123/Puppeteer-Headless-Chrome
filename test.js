// await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/67.0.3372.0 Safari/537.36');

const puppeteer = require('puppeteer');
const fs = require('fs-extra');
(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false,
            slowMo: 250 // slow down by 250ms
        });
        const page = await browser.newPage();
        page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1');
        // await page.goto('https://experts.shopify.com/');
        // await page.waitForNavigation();
        // await page.waitForSelector('.section');
        // const sections = await page.$$('.section');
        await page.goto('https://experts.shopify.com/');
        await page.waitForSelector('.section');
        const size = await page.$$('.section');
        await fs.writeFile('out.csv' , 'section,name\n');
        for (let i = 0;i < size.length;i++){
            await page.goto('https://experts.shopify.com/');
            await page.waitForSelector('.section');
            const sections = await page.$$('.section');

            const section= sections[i];
            const button = await section.$('a.marketing-button');
            const buttonName = await page.evaluate(button => button.innerText, button);
            console.log('\n\n');
            console.log(buttonName);
            button.click();
            await page.waitForSelector('#ExpertsResults');
            const lis = await page.$$('#ExpertsResults > li');
            for (const li of lis){
                const name = await li.$eval('h2', h2 => h2.innerText);
                console.log('name' , name);
                await fs.appendFile('out.csv', `"${buttonName}" , "${name}"\n`);
            }
        }
        console.log('done');
        await browser.close();

        // console.log(sections.length);
    } catch (e) {
        console.log('our error' , e);
    }

})();
