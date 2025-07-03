"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_notifier_1 = __importDefault(require("node-notifier"));
const nodemailer_1 = __importDefault(require("nodemailer"));
require('dotenv').config();
// String
;
// // Object
// notifier.notify({
//   title: 'My notification',
//   message: 'Hello, there!'
// });
let lastContentLength;
let hasBeenAnnounced = false;
let lastUpdateDate;
async function checkURL(name, url) {
    const data = await fetch(url, { method: 'HEAD' });
    const date = data.headers.get('Last-Modified');
    if (!date) {
        const conLength = parseInt(data.headers.get('Content-Length'));
        if (lastContentLength == undefined)
            lastContentLength = conLength;
        console.log(name + `: Page content length: ${conLength}; Delta: ${conLength - lastContentLength}; Status: ${data.status}, ${data.statusText}`);
        if (lastContentLength !== conLength) {
            node_notifier_1.default.notify(` ${name} has been updated. ${url}`);
            console.log(` ${name} has been updated. ${url}`);
            lastContentLength = conLength;
            hasBeenAnnounced = false;
            return true;
        }
        lastContentLength = conLength;
        return false;
    }
    if (!lastUpdateDate)
        lastUpdateDate = date;
    const delta = (Date.now() - new Date(date).getTime());
    const days = delta / 86400000;
    console.log(name + ': days since update:', days.toFixed(2));
    if (date != lastUpdateDate) {
        node_notifier_1.default.notify(`${name} WAS UPDATED ${(delta / 60000).toFixed(1)} MINUTES AGO`);
        hasBeenAnnounced = false;
        lastUpdateDate = date;
        return true;
    }
    if (delta / 60000 < 5) {
        console.log(`${name} WAS UPDATED ${(delta / 60000).toFixed(1)} MINUTES AGO`);
        lastUpdateDate = date;
        return true;
    }
    else
        return false;
}
let transporter;
const emails = ['radubitere5@gmail.com', 'ancastoica1997@gmail.com'];
async function updateTransporter() {
    transporter = nodemailer_1.default.createTransport({
        host: 'antares.webyouridea.ro',
        port: 587, // STARTTLS
        secure: false, // false because STARTTLS is used
        requireTLS: true,
        auth: {
            type: "login",
            user: process.env.EMAILADDRESS,
            pass: process.env.EMAILPASS
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
}
updateTransporter();
check();
setInterval(() => {
    check();
}, 30 * 1000);
function check() {
    console.clear();
    // checkURL('pagina principala', 'https://www.evaluare.edu.ro/')
    // checkURL('info', 'http://localhost:3000')
    checkURL('pagina principala', 'https://www.evaluare.edu.ro/').then(send => {
        if (!send || hasBeenAnnounced)
            return;
        hasBeenAnnounced = true;
        sendEmail();
    });
    // checkURL('info', 'http://localhost:3000').then(send => {
    //      if(!send || hasBeenAnnounced)
    //         return;
    //     hasBeenAnnounced=true
    //     sendEmail()
    // })
}
function sendEmail() {
    for (const email of emails) {
        var mailOptions = {
            from: 'noreply@intelegeinfo.ro',
            to: email,
            subject: "THEY'RE HEREEEEE!! 🥹🥹",
            html: `<pre style="font-family: Arial"><p>Holiii Ancus, se pare ca au venit rezultatele 🥹
(cred, stiu doar ca s-a modificat pagina pe care se publica)</p>
    
    Anyway, IM WISHING YOU GOOD LUCKKK JKJJAKJS
    I KNOW YOU WONT BE DISAPOINTED 💖💖💖
    Just know that I love ya no matter what
    si te astept sa ma chemi sa-mi iei teds MUAH HEHEHEHEHEH
    
    <img src='https://media.tenor.com/pmwfSUfWhC4AAAAM/dog.gif'>
    :3


    <a clicktracking="off" href='https://www.evaluare.edu.ro/'>Siteul evaluare.edu.ro</a> 🦐
    

<i>From your bf with love,
who will always be proud of ya,
Raducu <3</i>

</pre>`,
        };
        // var mailOptions = {
        //     from: 'noreply@intelegeinfo.ro',
        //     to: email,
        //     subject: "Emailu care ti zice cand se publica",
        //     text: `Holi ancusss :3333, daca ti a aparut in spam, apasa pe "asta nu e spam"
        //      sau ceva de genu ca sa l primesti ykyk. ANYHOW ITS GONNA BE OKEEEE TRUST ME.
        //      Stop stressing cuz you'll see there wont be any reason to :3`
        //     ,
        // };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.error("Error sending email: ", error);
            }
            else {
                console.log(info);
            }
        });
    }
}
