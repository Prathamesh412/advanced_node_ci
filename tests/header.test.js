const puppeteer = require('puppeteer');

let browser, page;

beforeEach(async () => {
    browser = await puppeteer.launch({headless: false});
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
})

afterEach(async () => {
    await browser.close();
})

test ("we launch a browser", async () => {
    
    const text = await page.$eval('a.brand-logo', el => el.innerHTML);
    expect(text).toEqual('Blogster');

})

test("click on my blogs link", async () => {
    await page.click('a[href="/blogs"]');
    const url = await page.url();
    expect(url).toContain('/blogs');
})