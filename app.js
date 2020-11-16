const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const express = require('express')
const bodyPraser = require('body-parser')
const morgan =  require('morgan')
const server = express()
const port = 13000
const cors = require('cors');
const sungai = require('./routes/sungai');
const model = require('./models/index');

server.use(bodyPraser.urlencoded({extended:false}))
server.use(bodyPraser.json())
server.use(morgan('dev'))
server.use('/sungai', sungai);
server.use(cors({origin: `http://localhost:${port}`}));

const SESSION_FILE_PATH = './whatsapp-session.json';
let sessionCfg;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionCfg = require(SESSION_FILE_PATH);
}

const client = new Client({ puppeteer: { headless: true }, session: sessionCfg });

client.initialize();

client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr);
});

client.on('authenticated', (session) => {
    console.log('AUTHENTICATED', session);
    sessionCfg=session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), function (err) {
        if (err) {
            console.error(err);
        }
    });
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessfull
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('READY');
});

client.on('message', async msg => {
    message = msg.body.toLowerCase()
    if (message == 'ping') {
        msg.reply('pong');
    }
    if (message == 'status') {
        const sungai = await model.sungai.findAll({
            limit: 1,
            order: [ [ 'createdAt', 'DESC' ]]
          });
          
        data = sungai[0].dataValues
        msg.reply(`Tinggi Air : ${data.tinggiAir} cm \nCuaca : ${data.cuaca} `);
    }
});
server.listen(port, () =>{
    console.log(`Service running on port ${port}`)
})