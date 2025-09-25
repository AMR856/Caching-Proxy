const crypto = require("crypto");
const path = require("path");
const fs = require('fs');

const makeCacheKey = (url) => crypto.createHash("sha1").update(url).digest("hex");

const getCacheFile = (url) => {
  const key = makeCacheKey(url);
  return path.join("cache-files", key + ".json");
};

const cacheAndSend = (url, originRes, clientRes) => {
  const chunks = [];
  
  originRes.on("data", (chunk) => chunks.push(chunk));

  originRes.on("end", () => {
    const body = Buffer.concat(chunks);

    const cachedData = {
      statusCode: originRes.statusCode,
      headers: originRes.headers,
      body: body.toString('base64'),
    };
    fs.writeFile(getCacheFile(url), JSON.stringify(cachedData), (err) => {
      if (err) console.error("Cache write error:", err);
    });

    for (const header in originRes.headers) {
      const value = originRes.headers[header];
      clientRes.setHeader(header, value);
    }
    clientRes.setHeader('X-Cache', 'MISS');
    clientRes.end(body);
  });
};

const readCache = (url) => {
  const file = getCacheFile(url);
  if (fs.existsSync(file)) {
    return fs.readFileSync(file, "utf8");
  }
  return null;
}

const fetchWithCache = (targetUrl) => readCache(targetUrl);

const clearCache = (cacheDir) => {
  fs.rmSync(cacheDir, { recursive: true, force: true }, (err) => {
      if (err) throw err;
    }
  );
}

module.exports = {
    cacheAndSend,
    fetchWithCache,
    clearCache
};