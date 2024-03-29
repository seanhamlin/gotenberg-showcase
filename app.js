const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const pdfRouter = require('./routes/pdf');

const rateLimit = require('express-rate-limit');

const app = express();

// Reverse proxies.
app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

// Rate limiter to prevent abuse.
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  limit: 10,
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false // Disable the `X-RateLimit-*` headers.
});

// Apply the rate limiting middleware to just the PDF requests.
app.use('/pdf', limiter);

// Parse POST bodies.
app.use(bodyParser.urlencoded({ extended: true }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'twig');

// Custom logger to log the PDF URL.
logger.token('pdf-url', function (req, res) { return req.body.url })
app.use(logger(":remote-addr :method :url HTTP/:http-version :status :res[content-length] - :response-time ms - :pdf-url"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/pdf', pdfRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
