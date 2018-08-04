const CREDS = require('./node_modules/creds');
const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const mongoose = require('mongoose');
const User = require('./models/user');

async function run() {
    const browser = await puppeteer.launch({
        devtools: true,
        // headless: false,
        // slowMo: 25
    });
    const page = await browser.newPage();
    await page.goto('https://github.com/login');
    const USERNAME_SELECTOR = '#login_field';
    const PASSWORD_SELECTOR = '#password';
    const BUTTON_SELECTOR = '#login > form > div.auth-form-body.mt-3 > input.btn.btn-primary.btn-block';
    await page.click(USERNAME_SELECTOR);
    await page.keyboard.type(CREDS.username);
    await page.click(PASSWORD_SELECTOR);
    await page.keyboard.type(CREDS.password);
    await page.click(BUTTON_SELECTOR);
    // await page.waitForNavigation();
    const userToSearch = 'john';
    const searchUrl = `https://github.com/search?q=${userToSearch}&type=Users&utf8=%E2%9C%93`;
    await page.goto(searchUrl);

    try{
        throw {
            name:        "System Error",
            level:       "Show Stopper",
            message:     "Error detected. Please contact the system administrator.",
            htmlMessage: "Error detected. Please contact the <a href=\"mailto:omkar.nath@appstreet.io\">system administrator</a>.",
            toString:    function(){return this.name + ": " + this.message;}
        };
        let numPages = await getNoPages(page);
        console.log("No. of pages : ", numPages);
        await page.waitForSelector('.user-list-item');
        const size = await page.$$('.user-list-item');
        await fs.writeFile('out.csv' , 'UserName,Email\n');
        for (let h = 1;h <= numPages;h++){
            let pageUrl = searchUrl + '&p=' + h;
            console.log(pageUrl);
            await page.goto(pageUrl);
            await page.waitForSelector('.user-list-item');
            const size = await page.$$('.user-list-item');
            for (let i = 0;i < size.length;i++){
                await page.goto(searchUrl);
                await page.waitForSelector('.user-list-item');
                const sections = await page.$$('.user-list-item');
                // console.log(sections.length);
                const section= sections[i];
                // console.log('print this');
                // console.log(section);
                const name = await section.$('div.d-flex > div > a');
                const Name = await page.evaluate(name => name.innerText, name);
                // console.log(Name);
                const mail = await section.$('div.d-flex > div > ul > li:nth-child(2) > a');
                if (!mail){
                    continue;
                }
                const Mail = await page.evaluate(mail => mail.innerText, mail);
                // console.log(Mail);
                console.log('Username : ' + Name + '   Email : ' + Mail);
                await fs.appendFile('out.csv', `"${Name}" , "${Mail}"\n`);
            }
        }
        console.log('done');
        await browser.close();
    }catch (e){
        console.log('our error', e );
    }

    // const LIST_USERNAME_SELECTOR = '#user_search_results > div.user-list > div:nth-child(1) > div.d-flex > div > a';
    const LIST_USERNAME_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex > div > a';
    // const LIST_EMAIL_SELECTOR = '#user_search_results > div.user-list > div:nth-child(2) > div.d-flex > div > ul > li:nth-child(2) > a';
    const LIST_EMAIL_SELECTOR = '#user_search_results > div.user-list > div:nth-child(INDEX) > div.d-flex > div > ul > li:nth-child(2) > a';
    const LENGTH_SELECTOR_CLASS = 'user-list-item';
    await page.waitForSelector('.user-list-item');
    const listLength = await page.$$('.user-list-item');
    console.log(listLength.length);

    // await page.evaluate(() => {debugger;});
    try{
        let numPages = await getNumPages(page);
        console.log('Numpages: ', numPages);
        for (let h = 1; h <= numPages; h++) {
            let pageUrl = searchUrl + '&p=' + h;
            console.log(pageUrl);
            await page.goto(pageUrl);
            let listLength = await page.evaluate((sel) => {
                return document.getElementsByClassName(sel).length;
            }, LENGTH_SELECTOR_CLASS);
            for (let i = 1; i <= listLength; i++) {
                // change the index to the next child
                let usernameSelector = LIST_USERNAME_SELECTOR.replace("INDEX", i);
                let emailSelector = LIST_EMAIL_SELECTOR.replace("INDEX", i);
                let username = await page.evaluate((sel) => {
                    return document.querySelector(sel).getAttribute('href').replace('/', '');
                }, usernameSelector);
                let email = await page.evaluate((sel) => {
                    let element = document.querySelector(sel);
                    return element? element.innerHTML: null;
                }, emailSelector);
                // not all users have emails visible
                if (!email)
                    continue;
                console.log(username, ' -> ', email);
                // TODO save this users
                upsertUser({
                    username: username,
                    email: email,
                    dateCrawled: new Date()
                });
                // brew services start mongodb
                // mongo
                // show dbs
                // use thal
                // db.users.find()
                // show collections
                // db.users.find().pretty()
            }
        }
    }catch (e){
        console.log('our error', e);
    }

    // await page.goto(searchUrl);
    await page.waitFor(2*1000);
    await page.screenshot({ path: 'screenshots/github.png' });
    browser.close();
}

function upsertUser(userObj) {

    const DB_URL = 'mongodb://localhost/thal';

    if (mongoose.connection.readyState == 0) { mongoose.connect(DB_URL); }

    // if this email exists, update the entry, don't insert
    let conditions = { email: userObj.email };
    let options = { upsert: true, new: true, setDefaultsOnInsert: true };

    User.findOneAndUpdate(conditions, userObj, options, (err, result) => {
        if (err) throw err;
    });
}

async function getNoPages(page) {
    const selector = '#js-pjax-container > div > div > div.column.three-fourths.codesearch-results > div > div.d-flex.flex-justify-between.border-bottom.pb-3 > h3';
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
    // console.log(isNaN(term)? 'value is string' : term);
    let numPages = Math.ceil(term / 10);
    return numPages;
}
async function getNumPages(page) {
    const NUM_USER_SELECTOR = '#js-pjax-container > div > div > div.column.three-fourths.codesearch-results > div > div.d-flex.flex-justify-between.border-bottom.pb-3 > h3';

    let inner = await page.evaluate((sel) => {
        let html = document.querySelector(sel).innerHTML;

        // format is: "69,803 users"
        return html.replace(',', '').replace('users', '').trim();
    }, NUM_USER_SELECTOR);
    let numUsers = parseInt(inner);
    console.log('numUsers: ', numUsers);
    // GitHub shows 10 resuls per page, so
    let numPages = Math.ceil(numUsers / 10);
    return numPages;
}

run();
