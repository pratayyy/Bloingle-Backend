const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const admin = require('firebase-admin');
const aws = require('aws-sdk');

const serviceAccountKey = require('./bloingle-firebase-adminsdk-68lpx-cb81476ee7.json');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoute');

const app = express();

const s3 = new aws.S3({
  region: 'ap-south-1',
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

app.enable('trust proxy');

app.use(express.json());

app.use(cors());

app.options('*', cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
