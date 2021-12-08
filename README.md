# servbot

A small dev server script for local static site development. Fork of [servor](https://github.com/lukejacksonn/servor). Experimental.

```js
import servbot from '../index.js';
import { watch } from 'watchlist';

const server = servbot({
    root: './example/',
    reload: true,
    fallback: 'index.html'
});

server.listen(8080);

(async() => {
    await watch(['example'], async () => {
        console.log('change detected! reloading...');
        server.reload();
    });
})();
```

This is an opinionated fork of `servor` with some intentional exclusions and smaller scope, with some ideas taken from [nativew/serve](https://github.com/nativew/serve). See both of those projects if you need something more full-featured and mature.
