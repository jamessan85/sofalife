const express = require('express')
const app = express();
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const nodemailer = require("nodemailer");

const sofas = ["/zinc/i","/quartz/i"];

function setMail(sofa) {
    const mailoptions = {
        from: 'sofa@sandmandesign.co.uk',
        to: ["jamessandersoon@gmail.com", "mikesanderson85@gmail.com"],
        subject: `Your sofa ${sofa} is in the clearence`,
        body: "It's in the clearence"
    }
    return mailoptions
}


const transporter = nodemailer.createTransport({
    host: "smtp.123-reg.co.uk",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "james@sandmandesign.co.uk",
        pass: "Lucaton1!"
    }
})

async function getClearence() {
    try {
        const browser = await puppeteer.launch({args: ['--no-sandbox']});
        const page = await browser.newPage();
        await page.goto('https://www.dfs.co.uk/clearance/all-clearance/q/sort/live_prod_uk_products/', {waitUntil: 'networkidle2'});
        const html = await page.evaluate(() => document.body.innerHTML)
        await browser.close();
        const $ = cheerio.load(html);
        const text = $('.rangeProduct').text();
        for (sofa in sofas) {
            const search = text.search(sofa)
            if (search >= 0) {
                const createMail = setMail(sofas[sofa])
                const info = await transporter.sendMail(createMail)
            }
        }
        return true
    } catch (e) {
        throw e
    }
    
}

app.get('/sofaprices', async function (req, res){
    try {
        const result = await getClearence();
        if (result) {
            res.sendStatus(200) 
        }
    } catch (e) {
        console.log(e);
    }
    
})

app.get('/', (req, res) => {
  res
    .status(200)
    .send('Hello, world!')
    .end();
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});