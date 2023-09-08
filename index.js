const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');


const axios = require('axios');


const data = {
    "monthYear": { "y": 2023, "m": 8 },
    "reportGroups": [
        {
            "id": "64ddad5d1bb309822ceb391c",
            "ops": [
                {
                    "_id": "64ddb5141bb3092274eb421c",
                    "isArchived": false,
                    "title": "OP 17 aug",
                    "formId": "64ddae461bb309a5c6eb3b78",
                    "workAreaId": "64ddad5d1bb309822ceb391c"
                },
                {
                    "_id": "64ddb5371bb3096178eb4274",
                    "isArchived": false,
                    "title": "Res 17 aug",
                    "formId": "64ddafb61bb3099befeb3d3c",
                    "workAreaId": "64ddad5d1bb309822ceb391c"
                },
                {
                    "_id": "64ddbfe0a07a82c5b62bdde2",
                    "isArchived": false,
                    "title": "Conditional file upload",
                    "formId": "64ddbf89a07a823eb92bdbfd",
                    "workAreaId": "64ddad5d1bb309822ceb391c"
                }
            ]
        }
    ]
};

const templatePath = path.join(__dirname, '/template.ejs');
const template = fs.readFileSync(templatePath, 'utf-8');


// Function to generate PDF from HTML using Puppeteer
async function generatePDF(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setContent(htmlContent);

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true
    });

    await browser.close();

    return pdfBuffer;
}

async function main() {
    //You can use hear json data insted of using any url

    // or user Data 
    const jsonData = await axios.post('https://apidev.didge.io/api/networks/64b62f8b50aebb82b555ac3f/sites/64ddad361bb3090de7eb38d8/departments/64ddad4b1bb30978f0eb3909/reports/detailed', data, {
        headers: {
            'authority': 'apidev.didge.io',
            'accept': 'application/json, text/plain, */*',
            'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
            'authorization': 'Bearer YOUR_ACCESS_TOKEN', // Replace with your actual token
            'content-type': 'application/json',
            'origin': 'https://dev.didge.io',
            'referer': 'https://dev.didge.io/',
            'sec-ch-ua': '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': 'Linux',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-site',
            'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',

        },
        responseType: 'json'
    })

    // Render the EJS template with jsonData
    const renderedHTML = ejs.render(template, { data: jsonData.data[0] });


    // Generate PDF
    const generatedPDF = await generatePDF(renderedHTML);

    // Create a transporter and send the email with PDF attachment
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'Use your Email',
            pass: 'Add password',
        },
    });

    const mailOptions = {
        from: 'Use your Email',
        to: 'Receiver Email',
        subject: 'PDF Report',
        text: 'Attached is a PDF report generated from EJS template using Puppeteer.',
        attachments: [
            {
                filename: 'report.pdf',
                content: generatedPDF,
                contentType: 'application/pdf',
            },
        ],
    };

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

main().catch(error => {
    console.error('Error:', error);
});





