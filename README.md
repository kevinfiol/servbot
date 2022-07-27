# servbot

A small dev server for local static site development. Essentially a wrapper around [http.Server](https://nodejs.org/api/http.html#class-httpserver). Fork of [servor](https://github.com/lukejacksonn/servor).

```js
import servbot from 'servbot';

const server = servbot({
    root: './public/',
    reload: true,
    fallback: 'index.html'
});

server.listen(8080);
```

This is an opinionated fork with some intentional exclusions and smaller scope, and some ideas taken from [nativew/serve](https://github.com/nativew/serve).

## Install

```bash
npm install servbot --save-dev
```

## Usage

See types in [index.d.ts](/index.d.ts). servbot accepts a single argument, `ServbotOptions`; and returns an instance of `ServbotServer`. See below for the default options.

```js
import servbot from 'servbot';

const server = servbot({
    // root: string
    // Directory to serve. Relative to process.cwd().
    root: '.',

    // reload: boolean
    // Flag to enable manual reload.
    reload: false,

    // fallback: string
    // Filename to fallback to for single-page applications. Relative to `root`.
    // Leaving this empty assumes you are not serving a single-page application
    fallback: '',

    // ignores: RegExp[]
    // *Only applicable when `fallback` is provided and `ignores` is not an empty array*
    // A list of patterns to *not* route to your fallback
    // Useful when you want to be able to route non-filetypes to your SPA ("/foo/routename.hi")
    // But otherwise, want to "ignore" routes that should be static files ("/main.css", "/js/jquery.js")
    ignores: [],

    // credentials: object
    // TLS Credentials. Providing these enables an HTTPS server
    // See https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener
    credentials: undefined
});

// Start server on port 8080
server.listen(8080);

// Close server from new connections
// https://nodejs.org/api/net.html#serverclosecallback
server.close((err) => {
    if (err) process.exit();
});
```

### Using manual reload

Instead of including a filewatcher to automatically reload your app on file changes, servbot includes a *manual* reload feature. Most modern front-end development build tools already include a built-in watch feature (esbuild, rollup, webpack, parcel, etc.) that can be leveraged by servbot. For an example with [rollup](https://rollupjs.org/guide/en/), see [here](/example/rollup.config.js).

Outside of build tools, you can also use something like [cheap-watch](https://github.com/Conduitry/cheap-watch) or [watchlist](https://github.com/lukeed/watchlist). See below for an example using watchlist:

```js
import servbot from 'servbot';
import { watch } from 'watchlist';

const server = servbot({
    root: './example/static/',
    reload: true,
    fallback: 'index.html'
});

server.listen(8080);

(async () => {
    await watch(['./example/static/'], async () => {
        console.log('change detected! reloading...');
        server.reload();
    });
})();
```

## To-Do

* Tests for SPA example
* HTTP/2 support
