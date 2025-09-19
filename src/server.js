import express from 'express';
import userRouter from './controller/userController.js';
import { logger, loggerMiddleware } from './util/logger.js';
import ticketRouter from './controller/ticketController.js'

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(loggerMiddleware);
app.use('/', userRouter, ticketRouter);

app.listen(PORT, () => logger.info(`Server Started on PORT:${PORT}`));
