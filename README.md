# Proxy Caching Server

A simple **HTTP proxy server** written in Node.js that forwards requests to an origin server, follows redirects, and caches responses on disk for faster subsequent access.

## ✨ Features
- 🔀 **Redirect handling**: Automatically follows `301`, `302`, `303`, `307`, and `308` redirects.
- 💾 **Response caching**: Stores responses in a local `cache-files` directory for reuse.
- ⚡ **Cache hit optimization**: Serves cached responses instantly with a custom `X-Cache: HIT` header.
- 🧹 **Cache clearing**: Supports a `--clear-cache` flag to delete all cached files.
- 🛡️ **Error handling**: Returns appropriate status codes for too many redirects or bad gateways.

## 📦 Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/your-username/proxy-cache-server.git
cd proxy-cache-server
npm install


## 🚀 Usage

Run the server with:

```bash
node index.js --port=3000 --origin=http://dummyjson.com --redirect=10
```

### Options

* `--port <number>`
  Port to run the proxy server on. Default: `3000`.

* `--origin <url>`
  Origin server to forward requests to. Default: `http://dummyjson.com`.
* `--redirect`
  The number of allowed redirections

* `--clear-cache`
  Clears the cache and exits.

### Examples

Start server on port `4000`:

```bash
node index.js --port=4000 --origin=https://example.com
```

Clear cache:

```bash
node index.js --clear-cache
```

## 📂 Project Structure

```
.
├── index.js               # Main proxy server
├── utils/
│   └── cache-functions.js # Cache management utilities
├── cache-files/           # Cached responses (auto-created)
└── package.json
```

## ⚙️ How It Works

1. Incoming requests are mapped to the origin server.
2. If a cached response exists, it is served immediately with headers restored.
3. If no cache is found:

   * The request is proxied to the origin.
   * Redirects are followed if necessary.
   * The response is cached and sent back to the client.

Solution for Caching Proxy Project for **https://roadmap.sh/projects/caching-server**
