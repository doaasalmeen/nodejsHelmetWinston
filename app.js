const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const winston = require('winston');
const app = express();

app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], 
      scriptSrc: ["'self'"],   
      styleSrc: ["'self'"],    
      imgSrc: ["'self'", "data:"], 
    },
  })
);

const logger = winston.createLogger({
  level: 'info', 
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/app.log' }) 
  ]
});

//home page
app.get('/', (req, res) => {
  logger.info('Home page');
  res.send('Welcome!');
});
//error
app.get('/error', (req, res) => {
  try {
    throw new Error('Test error');
  } catch (err) {
    logger.error(`error: ${err.message}`);
    res.status(500).send('Server error');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Listening on http://localhost:${PORT}`);
});
