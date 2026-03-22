/**
 * Fixed-body HTML decoy (always HTTP 200) so directory fuzzing cannot rely on
 * status codes; filter with ffuf -fs (response size) to find real endpoints.
 */
const PADDING_LEN = 2400;
const DECOY_HTML =
  '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Training Portal</title>' +
  '<link rel="stylesheet" href="/styles.css">' +
  '</head><body><main class="container">' +
  '<section class="content-block">' +
  '<h1>Unavailable</h1>' +
  '<p>No public resource matches this path.</p>' +
  '</section></main></body></html>' +
  '<!--' +
  'x'.repeat(PADDING_LEN) +
  '-->';

function sendDecoy(res) {
  res.status(200);
  res.set('Cache-Control', 'no-store');
  res.type('html');
  return res.send(DECOY_HTML);
}

module.exports = { sendDecoy };
