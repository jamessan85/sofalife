const express = require('express')
const app = express();
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const rp = require("request-promise-native");
const nodemailer = require("nodemailer");

const sofas = ["/zinc/i","/quartz/i", "/power/i"];

function setMail(sofa) {
    const mailoptions = {
        from: 'sofa@sandmandesign.co.uk',
        to: "jamessandersoon@gmail.com",
        subject: `Your sofa ${sofa} is in the clearence`,
        body: "It's in the clearence"
    }
    return mailoptions
}


const transporter = nodemailer.createTransport({
    host: "smtp.123-reg.co.uk",
    port: 25,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "james@sandmandesign.co.uk",
        pass: "Lucaton1!"
    }
})

async function getClearence() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://www.dfs.co.uk/clearance/all-clearance/q/sort/live_prod_uk_products/', {waitUntil: 'networkidle2'});
        const html = await page.evaluate(() => document.body.innerHTML)
        await browser.close();
        const $ = cheerio.load(html);
        const text = $('.rangeProduct').text();
        for (sofa in sofas) {
            const search = text.search(sofa)
            if (search) {
                const createMail = setMail(sofa)
                const info = await transporter.sendMail(createMail)
                console.log(info)
            }
        }
    } catch (e) {
        console.log(e)
    }
    
}


getClearence();

app.listen(8000, () => {
  console.log('Sofa app listening on port 8000!')
});