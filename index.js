#!/usr/bin/node
const minimist = require("minimist");
const args = minimist(process.argv.slice(2));
console.log(args);
const http = require("http");
const https = require("https");
const { URL } = require("url");
const fs = require("fs");
const path = require("path");
const port = args.port ||3000;
const maxRedirectionTimes = args.redirect || 5;
const origin = args.origin || "http://dummyjson.com";
const clearCache = args['clear-cache'];
const cacheDir = path.join(__dirname, "cache-files");
const redirectionList = [301, 302, 303, 307, 308];

if (!fs.existsSync(cacheDir)) {
  fs.mkdirSync(cacheDir);
}

const cacheFunctions = require('./utils/cache-functions');

if (clearCache) {
  cacheFunctions.clearCache(cacheDir);
  process.exit(0);
}

const followRedirect = (reqOptions, clientReq, clientRes, url, originURL, depth = 0,) => {
  const protocol = url.protocol === "https:" ? https : http;

  const proxy = protocol.request(reqOptions, (originRes) => {
    if (redirectionList.includes(originRes.statusCode)) {
      const location = originRes.headers.location;

      if (depth > maxRedirectionTimes) {
        clientRes.writeHead(508);
        return clientRes.end("Too many redirects");
      }

      const newUrl = new URL(location, url);
      const newOptions = {
        ...reqOptions,
        hostname: newUrl.hostname,
        path: newUrl.pathname + newUrl.search,
      };
      return followRedirect(newOptions, clientReq, clientRes, newUrl, originURL, depth + 1);
    }

    cacheFunctions.cacheAndSend(originURL, originRes, clientRes);
  });

  clientReq.pipe(proxy);
  proxy.on("error", (err) => {
    clientRes.writeHead(502);
    clientRes.end("Bad Gateway: " + err.message);
  });
};

const server = http.createServer((req, res) => {
  const targetUrl = new URL(req.url, origin);
  const stringURL = targetUrl.href;
  const cachedRes = JSON.parse(cacheFunctions.fetchWithCache(stringURL));
  if (cachedRes){
  for (const header in cachedRes.headers) {
    const value = cachedRes.headers[header];
    res.setHeader(header, value);
  }
    res.setHeader('X-Cache', 'HIT');
    res.end(Buffer.from(cachedRes.body, "base64"));
    return;
  }
  const reqOptions = {
    method: req.method,
    headers: { ...req.headers, host: targetUrl.host },
    hostname: targetUrl.hostname,
    path: targetUrl.pathname + targetUrl.search,
  };

  followRedirect(reqOptions, req, res, targetUrl, stringURL);
});

server.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}, forwarding to ${origin}`);
});