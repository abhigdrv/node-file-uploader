const express = require('express');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use(bodyParser.json({ limit: '502mb' }));
app.use(bodyParser.urlencoded({ limit: '502mb', extended: true }));

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
    cb(null, file.originalname);
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
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: 'support@pinnacleedits.com',
      pass: 'zrlq pasx cviu uwod'
    }
  });

  const mailOptions = {
    from: 'support@pinnacleedits.com',
    to: req.body.email,
    bcc: 'workfinance2020@gmail.com',
    subject: `Pinnacle Edits - Order Images Uploaded - ${req.body.orderNo}`,
    text: `
Thank You!,

You successfully uploaded ${req.body.totalFiles} images for Order ( ${req.body.orderNo} )

You may continue to upload additional files or view a list of the uploaded files by visiting your Dashboard and clicking the Upload button.

If you have any questions about our services, please feel free to contact us on support@pinnacleedits.com .

Sincerely,
Pinnacle Edits
Email: support@pinnacleedits.com
Skype Id : live:.cid.676ec97f3452e8cc | +1 424 255 7675
`
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
