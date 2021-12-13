import assert from 'assert';
import { get } from 'http';
import servbot from './index.js';
import zlib from 'zlib';
import dedent from 'dedent-js';

let passes = 0;
let failures = 0;

const PORT = 8097;
const HOST = `http://localhost:${PORT}`;

const staticOpts = {
    root: './example/static/',
    reload: false,
    fallback: ''
};

let server;
let listening = false;

const start = (opts) => {
    server = servbot(opts);
    server.listen(PORT);
    listening = true;
};

const close = () => {
    server.close();
    listening = false;
};

(async () => {
    await suite('servbot test suite', [
        test('Start & stop static server smoke test', () => {
            start(staticOpts);
            close();
        }),

        test('Index page', async () => {
            start(staticOpts);
            let data = await gzipGet(HOST);

            let expected = dedent`
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <link rel="stylesheet" href="/main.css">
                      <title>servbot example 1 home</title>
                  </head>
                  <body>
                    <h1>hello world</h1>
                  </body>
                </html>
            `.replace(/\n/g,'\r\n');

            assert.equal(data, expected);

            close();
        }),

        test('About page', async () => {
            start(staticOpts);
            let data = await gzipGet(HOST + '/about');

            let expected = dedent`
                <!DOCTYPE html>
                <html lang="en">
                  <head>
                      <meta charset="UTF-8">
                      <meta name="viewport" content="width=device-width, initial-scale=1.0">
                      <link rel="stylesheet" href="/main.css">
                      <title>servbot example 1 about</title>
                  </head>
                  <body>
                    <h1>about</h1>
                  </body>
                </html>
            `.replace(/\n/g,'\r\n');

            assert.equal(data, expected);

            data = await gzipGet(HOST + '/about/');
            assert.equal(data, expected);

            close();
        })
    ]);
})();

async function suite(name, tests) {
    console.log(`\x1b[1mSuite: ${name}\x1b[0m`);

    await new Promise(async (res) => {
        for (let i = 0, len = tests.length; i < len; i += 1) {
            await tests[i]();
        }

        res(true);
    });

    // Tests Finished
    console.log(`Tests Passed ✓: ${passes}`);
    console.warn(`Tests Failed ✗: ${failures}`);

    if (failures) logFail(`\n✗ Tests failed with ${failures} failing tests.`);
    else logPass(`\n✓ All ${passes} tests passed.`)
}

function test(label, cb) {
    return async () => {
        try {
            await cb();
            passes += 1;
        } catch (e) {
            failures += 1;
            logFail(`Failed Test: "${label}", at ${e.message}\n`)
            if (listening) close();
        }
    };
}

function logFail(str) {
    console.error(`\x1b[41m${str}\x1b[0m`);
}

function logPass(str) {
    console.log(`\x1b[42m${str}\x1b[0m`);
}

async function gzipGet(host) {
    return new Promise((res, rej) => {
        get(host, (response) => {
            const chunks = [];

            response.on('data', (chunk) => {
                chunks.push(chunk);
            });

            response.on('end', () => {
                const buffer = Buffer.concat(chunks);

                zlib.gunzip(buffer, (err, decoded) => {
                    if (err) {
                        rej(err);
                    } else {
                        res(decoded.toString());
                    }
                })
            });

            response.on('error', (e) => {
                rej(e);
            });
        }).on('error', (e) => {
            rej(e);
        });
    });
}