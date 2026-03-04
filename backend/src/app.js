import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from './config/logger.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  morgan('combined', {
    stream: { write: message => logger.info(message.trim()) },
  })
);

app.use(helmet());

app.get('/', (req, res) => {
  logger.info('Received a request to the root endpoint');
  res.send('Hello this is Zenora. Backend for learning platform!!');
});

export default app;
