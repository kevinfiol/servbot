import servbot from '../index.js';
import { watch } from 'watchlist';

const server = servbot({
    root: './example/spa/',
    reload: true,
    fallback: 'index.html'
});

server.listen(8080);

(async() => {
    await watch(['example/spa'], async () => {
        console.log('/example/spa/ changed; reloading...');
        server.reload();
    });
})();