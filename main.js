const express = require('express');
const { program } = require('commander');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

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

let inventory = [];
let currentId = 0;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, cacheDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/RegisterForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'RegisterForm.html'));
});

app.get('/SearchForm.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'SearchForm.html'));
});

app.post('/register', upload.single('photo'), (req, res) => {
    const { inventory_name, description } = req.body;

    if (!inventory_name) {
        return res.status(400).send('Помилка: inventory_name є обов\'язковим');
    }

    const newItem = {
        id: currentId++, 
        name: inventory_name,
        description: description || '',
        photo: req.file ? req.file.path : null
    };

    inventory.push(newItem);
    res.status(201).json(newItem);
});

app.get('/inventory', (req, res) => {
    const result = inventory.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        photo_url: item.photo ? `/inventory/${item.id}/photo` : null
    }));
    res.status(200).json(result);
});

const findItemById = (id) => inventory.find(item => item.id === parseInt(id));

app.listen(options.port, options.host, () => {
    console.log(`Сервер запущено на http://${options.host}:${options.port}`); 
});
