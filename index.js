import http from 'http';
import https from 'https';
import { gzipSync } from 'zlib';
import { URL } from 'url';
import { readFile, existsSync, statSync } from 'fs';
import { resolve, join } from 'path';
import mimes from './mimes.js';

const EVENT_SOURCE = '/servbot-listener';
const GZIP_EXTS = ['html', 'css', 'js', 'json', 'xml', 'svg'];

const RELOAD_HTML = `
    <script>
        (() => {
            const source = new EventSource('${EVENT_SOURCE}');
            const reload = () => location.reload(true);
            source.onmessage = reload;
            source.onerror = () => source.onopen = reload;
            console.log('servbot is listening for changes...');
        })();
    </script>
`;

/**
 * @typedef {object} ServbotOptions
 * @property {string} root
 * @property {boolean} reload
 * @property {string} fallback
 * @property {Record<string, unknown> | null} credentials
 * 
 * @typedef {object} ServbotServer
 * @property {(port: number) => void} listen
 * @property {() => void} reload
 * @property {(callback: Function) => void} close
 * 
 */

/**
 * @param {ServbotOptions} options
 * @returns {ServbotServer} server
 */
export default ({ root = '.', reload = false, fallback = '', credentials = null }) => {
    root = resolve(root);
    if (!existsSync(root) || !statSync(root).isDirectory()) {
        throw Error(`[servbot] Invalid root directory: ${root}`);
    }

    const protocol = credentials ? 'https://' : 'http://';
    const htmlToAppend = reload ? RELOAD_HTML : '';
    const clients = [];

    const createServer = credentials
        ? (listener) => https.createServer(credentials, listener)
        : (listener) => http.createServer(listener);

    const server = createServer((req, res) => {
        const reqPath = decodeURI(req.url);
        const url = new URL(reqPath, protocol + req.headers.host);

        let { pathname } = url;

        if (reload && pathname == EVENT_SOURCE) {
            res.writeHead(200, {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                Connection: 'keep-alive'
            });

            res.write('event: connected\ndata: ready\n\n\n');
            clients.push(res);
            return;
        }

        res.setHeader('Access-Control-Allow-Origin', '*');

        if (pathname.split('/').pop().indexOf('.') < 0) {
            if (fallback) {
                // dynamic route
                return routeResponse(res, pathname, root, fallback, htmlToAppend);
            }

            const isDirectoryRoute = pathname.slice(-1) === '/';
            pathname += (isDirectoryRoute ? 'index.html' : '/index.html');
        }

        const uri = join(root, pathname);
        const ext = uri.split('.').pop();

        if (!existsSync(uri)) {
            return errorResponse(res, pathname, 404);
        }

        readFile(uri, 'binary', (err, file) => {
            return err
                ? errorResponse(res, pathname, 500)
                : fileResponse(res, pathname, 200, file, ext, htmlToAppend);
        });
    });

    process.on('SIGINT', () => {
        clients.map((res) => res.end());
        process.exit();
    });

    return {
        listen: (port) => {
            log(`Server: ${protocol}localhost:${port}`);
            server.listen(port);
        },

        close: (callback) => {
            log(`Server closed: ${protocol}localhost:${port}`);
            server.close(callback);
        },

        reload: () => {
            if (!clients.length) return;
            const res = clients.pop();
            res.write('event: message\ndata: reload\n\n\n');
            res.end();
        }
    };
};

function routeResponse(res, pathname, root, fallback, htmlToAppend) {
    const route = join(root, fallback);

    readFile(route, 'binary', (err, file) => {
        if (err) return errorResponse(res, pathname, 500);
        const status = pathname === '/' ? 200 : 301;
        file += htmlToAppend;
        fileResponse(res, pathname, status, file, 'html');
    });
}

function fileResponse(res, pathname, status, file, ext, htmlToAppend) {
    let encoding = 'binary';

    if (GZIP_EXTS.includes(ext)) {
        if (ext === 'html' && htmlToAppend) file += htmlToAppend;
        res.setHeader('Content-Encoding', 'gzip');
        file = gzipSync(Buffer.from(file, 'binary').toString('utf8'));
        encoding = 'utf8';
    }

    res.writeHead(status, { 'Content-Type': mimes[ext] });
    res.write(file, encoding);
    logServer(status, pathname);
    res.end();
}

function errorResponse(res, pathname, status) {
    res.writeHead(status);
    res.write(`${status}`);
    logServer(status, pathname);
    res.end();
}

function log(message, error = false) {
    console.log(`\x1b[1${ error ? ';31' : '' }m[servbot] ${error ? 'ERROR: ' : ''}${message}\x1b[0m`);
}

function logServer(status, pathname) {
    const color = status >= 400 ? '31' : '32';
    console.log(`-> \x1b[1;${color}m${status}\x1b[0m - ${pathname}`);
}
