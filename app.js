const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccountKey = require('./bloingle-firebase-adminsdk-68lpx-cb81476ee7.json');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoute');
const blogRouter = require('./routes/blogRouter');

const app = express();

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
app.use('/api/v1/blogs', blogRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
