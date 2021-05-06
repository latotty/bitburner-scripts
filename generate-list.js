const fs = require('fs');
const path = require('path');
const glob = require("glob");

const FILES_TOKEN = '/* FILES */';
const TEMPLATE_FILE = './download.template.js';
const TARGET_FILE = './download.js';

const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

const fileList = glob.sync('**/*.js', { cwd: path.join(process.cwd(), 'scripts') });

const result = template.replace(FILES_TOKEN, JSON.stringify(fileList, null, 8).slice(1, -1));

const oldDownload = fs.existsSync(TARGET_FILE) ? fs.readFileSync(TARGET_FILE, 'utf8') : '';

if (result !== oldDownload) {
    fs.writeFileSync(TARGET_FILE, result);
    throw new Error('generated download.js')
}