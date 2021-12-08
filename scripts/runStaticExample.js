import servbot from '../index.js';
import { watch } from 'watchlist';

const server = servbot({
    root: './example/static/',
    reload: true,
    fallback: 'index.html'
});

server.listen(8080);

(async() => {
    await watch(['example'], async () => {
        console.log('/example changed; reloading...');
        server.reload();
    });
})();