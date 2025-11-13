const express = require('express');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan'); 
const winston = require('winston');
const app = express();

dotenv.config(); 

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
  ],
  exceptionHandlers: [
    new winston.transports.File({ filename: 'logs/exceptions.log' }),
    new winston.transports.Console()
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: 'logs/rejections.log' }), 
    new winston.transports.Console()
  ]
});

app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()), 
    },
  })
);

app.get('/', (req, res) => {
  logger.info('Home page accessed');
  res.send('Welcome!');
});

app.get('/error', (req, res) => {
  try {
    throw new Error('Test error');
  } catch (err) {
    logger.error(`Error: ${err.message}`);
    res.status(500).send('Server error');
  }
});

app.get('/promise-error', (req, res) => {
  Promise.reject(new Error('Unhandled promise rejection!'));
  res.send('This will trigger an unhandled rejection.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Listening on http://localhost:${PORT}`);
});
