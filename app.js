const express = require('express');
const morgan = require('morgan');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
// const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cors = require('cors');
const admin = require('firebase-admin');

const serviceAccountKey = require('./bloingle-firebase-adminsdk-68lpx-cb81476ee7.json');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userRouter = require('./routes/userRoute');
const blogRouter = require('./routes/blogRoute');
const commentRouter = require('./routes/commentRoute');
const notificationRouter = require('./routes/notificationRoute');

const app = express();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
});

app.enable('trust proxy');
app.set('trust proxy', false);

app.use(express.json());

app.use(cors());

app.options('*', cors());

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
  validate: { xForwardedForHeader: false },
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(mongoSanitize());

// Does not work because of editorjs containing different formatted fields
// app.use(xss());

app.use(hpp());

app.use(compression());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/blogs', blogRouter);
app.use('/api/v1/comments', commentRouter);
app.use('/api/v1/notifications', notificationRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
