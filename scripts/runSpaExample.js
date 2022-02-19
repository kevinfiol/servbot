import servbot from '../index.js';
import { watch } from 'watchlist';

const server = servbot({
    root: './example/spa/',
    reload: true,
    fallback: 'index.html',
    ignores: [
        // don't send /navaid.min.js to the SPA
        new RegExp('\/navaid.min.js', 'i'),
        // don't send any css files under /css to the SPA
        new RegExp('^\/css\/([^/]+?)\.(css)\/?$', 'i')
    ]
});

server.listen(8080);

(async() => {
    await watch(['example/spa'], async () => {
        console.log('/example/spa/ changed; reloading...');
        server.reload();
    });
})();