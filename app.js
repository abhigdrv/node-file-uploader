const express = require('express');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Storage configuration for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Extract folder name and ID from the URL
    const folderName = req.params.folder;
    const id = req.params.id;

    // Define the upload path
    const uploadPath = path.join(__dirname, 'uploads', folderName, id);

    // Ensure the directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Route for the home page
app.get('/', (req, res) => {
  res.render('index');
});

// Route for orders with id
app.get('/orders/:id', (req, res) => {
  res.render('upload', { type: 'orders', id: req.params.id });
});

// Route for freetrails with id
app.get('/freetrails/:id', (req, res) => {
  res.render('upload', { type: 'freetrails', id: req.params.id });
});

// Handle file uploads for freetrails
app.post('/upload/:folder/:id', upload.array('files'), (req, res) => {
  res.send('Files uploaded successfully');
});

// Route to send email
app.post('/send-email', (req, res) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password'
    }
  });

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient@example.com',
    subject: 'File Uploaded Successfully',
    text: `File uploaded: ${req.body.fileName}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
    res.send('Email sent successfully');
  });
});

// Route for thank you page
app.get('/thank-you', (req, res) => {
  res.render('thank-you');
});

io.on('connection', (socket) => {
  console.log('A user connected');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
