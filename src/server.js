const http = require('http');
const qs = require('querystring');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const responseHandler = require('./responses.js');

const urlStruct = {
  '/': responseHandler.getIndex,
  '/style.css': responseHandler.getCSS,
  '/getUsers': responseHandler.getUsers,
  '/addUser': responseHandler.addUser,
  notFound: responseHandler.notFound,
};

const onRequest = (request, response) => {
  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  if (request.method === 'POST') {
    const body = [];

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      request.body = { ...qs.parse(bodyString) };

      if (urlStruct[parsedUrl.pathname]) {
        return urlStruct[parsedUrl.pathname](request, response);
      }

      return urlStruct.notFound(request, response);
    });

    request.on('error', (err) => {
      console.error('Request error:', err);
      response.writeHead(500);
      response.end('Internal Server Error');
    });
  } else if (urlStruct[parsedUrl.pathname]) {
    return urlStruct[parsedUrl.pathname](request, response);
  }
  return urlStruct.notFound(request, response);
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on 127.0.0.1:${port}`);
});
