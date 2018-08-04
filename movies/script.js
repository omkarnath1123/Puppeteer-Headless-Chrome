const puppeteer = require('puppeteer');
const fs = require('fs-extra');

async function run(){
    const browser = await puppeteer.launch({
        // executablePath : '/Applications/Google Chrome.app/',
        devtools: true,
        headless: false,
        // slowMo: 250 // slow down by 250ms
    });

    const page = await browser.newPage();
    await page.goto('https://yts.am/browse-movies?page=1');
    await page.screenshot({path: 'example.png'});

    try {
        const searchUrl = `https://yts.am/browse-movies?page=1`;
        await page.goto(searchUrl);
        const countPages = await getNoPages(page);
        console.log("No. of pages : ", countPages);
        await fs.writeFile('store.csv' , 'movieName,releaseYear,720pLink,1080pLink\n');

        for (let i = 1;i < countPages;i++){
            const Url = `https://yts.am/browse-movies?page=`;
            const getUrl = Url + i;
            await page.goto(getUrl);
            console.log(getUrl);
            await page.waitForSelector('.browse-movie-wrap');
            const size = await page.$$('.browse-movie-wrap');
            // console.log(size);
            for (let j = 1;j < size.length + 1;j++){
                const link = 'body > div.main-content > div.browse-content > div > section > div > div:nth-child(' + j +') > a';
                // console.log(link);

                await page.waitForSelector(link);
                const anchors = await page.$(link);
                const nextUrl = await page.evaluate(anchors => anchors.href, anchors);
                console.log(nextUrl);
                await page.goto(nextUrl);

                // await page.evaluate(() => {debugger;});
                // const click = '#synopsis';
                // await page.click(click);

                const name = '#mobile-movie-info > h1';  //#mobile-movie-info > h1
                const year = '#mobile-movie-info > h2:nth-child(2)';
                const genres = '#mobile-movie-info > h2:nth-child(3)';
                const image = '#movie-poster > img';
                const rottenTomatoesCriticsRotten = '#movie-info > div.bottom-info > div:nth-child(2) > span:nth-child(2)';
                const rottenTomatoesAudienceSpilled = '#movie-info > div.bottom-info > div:nth-child(3) > span:nth-child(2)';
                const imdb = '#movie-info > div.bottom-info > div:nth-child(4) > span:nth-child(2)';
                const link720p = '#movie-info > div.bottom-info > p > a:nth-child(1)';
                const link1080p = '#movie-info > div.bottom-info > p > a:nth-child(2)';

                await page.waitForSelector('#mobile-movie-info');
                // await page.waitForSelector(name);
                // await page.waitForSelector(year);
                // await page.waitForSelector(genres);
                // await page.waitForSelector(image);

                let Names = await page.evaluate((sel) => {
                    let element = document.querySelector(sel);
                    return element? element.innerHTML: null;
                }, name);
                console.log('movie name : ', Names);

                let Years = await page.evaluate((sel) => {
                    let element = document.querySelector(sel);
                    return element? element.innerHTML: null;
                }, year);
                console.log('release year : ', Years);

                let Genress = await page.evaluate((sel) => {
                    let element = document.querySelector(sel);
                    return element? element.innerHTML: null;
                }, genres);
                console.log('type : ', Genress);

                let Images = await page.evaluate((sel) => {
                    let element = document.querySelector(sel).getAttribute('src');
                    return element? element: null;
                }, image);
                console.log('image link : ', Images);

                let RottenTomatoesCriticsRotten = await page.evaluate((sel) => {
                    let element = document.querySelector(sel);
                    return element? element.innerHTML: null;
                }, rottenTomatoesCriticsRotten);
                console.log('Rotten Tomatoes Critics - Rotten : ', RottenTomatoesCriticsRotten);

                let RottenTomatoesAudienceSpilled = await page.evaluate((sel) => {
                    let element = document.querySelector(sel);
                    return element? element.innerHTML: null;
                }, rottenTomatoesAudienceSpilled);
                console.log('Rotten Tomatoes Audience - Spilled : ', RottenTomatoesAudienceSpilled);

                let Imdb = await page.evaluate((sel) => {
                    let element = document.querySelector(sel);
                    return element? element.innerHTML: null;
                }, imdb);
                console.log('imdb : ', Imdb);

                let Link720p = await page.evaluate((sel) => {
                    let element = document.querySelector(sel).getAttribute('href');
                    return element? element: null;
                }, link720p);
                console.log('720p link : ', Link720p);

                let Link1080p = await page.evaluate((sel) => {
                    let element = document.querySelector(sel).getAttribute('href');
                    return element? element: null;
                }, link1080p);
                console.log('1080p link : ', Link1080p);



                // const print = await xpath(page, '//*[@id="mobile-movie-info"]/h1');
                // console.log(await page.evaluate(e => e.textContent, print));
                // console.log(await page.evaluate(e => e.textContent, handle2));

                // const Name = await page.evaluate(name => name.innerText, name);
                // const Year = await page.evaluate(year => year.innerText, year);
                // const Genres = await page.evaluate(genres => genres.innerText, genres);
                // const Image = await page.evaluate(image => image.src, image);



                await fs.appendFile('store.csv', ` ${Names} , ${Years} , ${Genress} , ${Images} , ${rottenTomatoesCriticsRotten} , ${rottenTomatoesAudienceSpilled} , ${Imdb} \n `);
                await page.goto(getUrl);

                // await page.goto(searchUrl);
                // await page.waitForSelector('.user-list-item');
                // const sections = await page.$$('.user-list-item');
            }
        }
    }catch (e) {
        console.log('our error : ', e );
    }
    await page.evaluate(() => console.log(`url is ${location.href}`));
    // await browser.close();
}
async function getNoPages(page) {
    const selector = 'body > div.main-content > div.browse-content > div > h2';
    // await page.evaluate(() => {debugger;});
    await page.waitForSelector(selector);
    const total = await page.$(selector);
    // console.log(total);
    const Count = await page.evaluate(total => total.innerText, total);
    console.log(Count);

    let value = "";
    for (let i = 0;i < Count.length;i++){
        if(!isNaN(Count.charAt(i))) {
            value = value + Count.charAt(i);
        }
    }
    // let check = Count.replace(',', '').replace('users', '').trim();
    let term = parseInt(value);
    console.log(term);
    let numPages = Math.ceil(term / 20);
    return numPages;
}

async function xpath(page, path) {
    const resultsHandle = await page.evaluateHandle(path => {
        let results = [];
        let query = document.evaluate(path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i=0, length = query.snapshotLength; i < length; ++i) {
            results.push(query.snapshotItem(i));
        }
        return results;
    }, path);
    const properties = await resultsHandle.getProperties();
    const result = [];
    const releasePromises = [];
    for (const property of properties.values()) {
        const element = property.asElement();
        if (element)
            result.push(element);
        else
            releasePromises.push(property.dispose());
    }
    await Promise.all(releasePromises);
    return result;
}

run();