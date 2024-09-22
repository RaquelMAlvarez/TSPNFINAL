
// index.js
const express = require('express');
const mustacheExpress = require('mustache-express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser')

// load environment variables
require('dotenv').config()

// Initialize express app
const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser())


// Configure Mustache as template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

// Routes
const homeRoutes = require('./routes/homeRoutes');
const foodRoutes = require('./routes/foodRoutes');
const userRoutes = require('./routes/userRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const contactRoutes = require('./routes/contactRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use('/', homeRoutes); // Home
app.use('/food', foodRoutes); // Food
app.use('/user', userRoutes); // User
app.use('/about', aboutRoutes); // About
app.use('/contact', contactRoutes); // Contact
app.use('/message', messageRoutes); // Message

// Start the server//Ctrl^c to quit.
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});












