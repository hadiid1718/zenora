import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.get('/', (req, res) => {
  res.send('Hello this is Zenora. Backend for learning platform!!');
});

export default app;
