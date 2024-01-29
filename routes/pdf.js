const express = require('express');
const router = express.Router();
const { pipe, gotenberg, convert, url, to, please } = require('gotenberg-js-client');
const validUrl = require('valid-url');

/* PDF generation view. */
router.post('/', async function (req, res, next) {

  // Basic validation on the URL.
  if (!validUrl.isUri(req.body.url)) {
    return res.status(406).send('Invalid URL');
  }

  // Block internal paths.
  if (req.body.url.includes(".local")) {
    return res.status(406).send('Invalid URL');
  }

  // @see https://github.com/yumauri/gotenberg-js-client/issues/32#issuecomment-1057986328
  const toPDF = pipe(
    gotenberg('http://gotenberg:3000/forms/chromium'),
    convert,
    url,
    to({ margins: [0, 0, 0, 0] }), // it is better to remove margins with URL conversion
    (request) => {
      request.fields.url = request.fields.remoteURL
      delete request.fields.remoteURL
      return request
    },
    please
  );

  const pdf = await toPDF(req.body.url);

  pdf.pipe(res);
});

module.exports = router;
