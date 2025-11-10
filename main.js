const express = require('express');
const { program } = require('commander');
const fs = require('fs');
const path = require('path');

program
    .option('-h, --host <type>', 'Адреса') 
    .option('-p, --port <type>', 'Порт')
    .option('-c, --cache <type>', 'Шлях до директорії кешу')
    .parse(process.argv);

const options = program.opts();

if (!options.cache) {
    console.error('Помилка: не задано обов\'язковий параметр --cache');
    process.exit(1);
}

const cacheDir = path.resolve(options.cache);
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
    console.log(`Створено директорію кешу: ${cacheDir}`);
}

const app = express();

app.listen(options.port, options.host, () => {
    console.log(`Сервер запущено на http://${options.host}:${options.port}`); // 
});
