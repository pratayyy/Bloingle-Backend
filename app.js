const express = require('express');
const userRouter = require('./routes/userRoute');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/api/v1/users', userRouter);

module.exports = app;
