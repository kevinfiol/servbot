import servbot from '../index.js';
import { watch } from 'watchlist';

const server = servbot({
    root: './example/static/',
    reload: true,
});

server.listen(8080);

(async() => {
    await watch(['example/static'], async () => {
        console.log('/example/static/ changed; reloading...');
        server.reload();
    });
})();