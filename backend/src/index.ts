import express from 'express';
import cors from 'cors'
import { userRouter } from '@/routes/user.routes';
import morgan from 'morgan'
import { batchRouter } from '@/routes/batch.routes';

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/users', userRouter);
app.use('/api/batches', batchRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});