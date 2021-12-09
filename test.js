import assert from 'assert';
import { get as getCb } from 'http';
import { promisify } from 'util';
import servbot from './index.js';

const get = promisify(getCb);

let res;
let passes = 0;
let failures = 0;

const PORT = 8097;

const staticOpts = {
    root: './example/static/',
    reload: false,
    fallback: ''
};

const spaOpts = {
    root: './example/spa/',
    reload: false,
    fallback: 'index.html'
};

let server;

const start = (opts) => {
    server = servbot(opts);
    server.listen(PORT);
};

const close = () => {
    server.close();
}

await suite('servbot test suite', [
    test('Start static server', () => {
        start(staticOpts);
        close();
    }),

    test('Start spa server', () => {
        start(spaOpts);
        close();
    }),
]);

async function suite(name, tests) {
    console.log(`\x1b[1mSuite: ${name}\x1b[0m`);
    await Promise.all(tests);

    // Tests Finished
    console.log(`Tests Passed ✓: ${passes}`);
    console.warn(`Tests Failed ✗: ${failures}`);

    if (failures) logFail(`\n✗ Tests failed with ${failures} failing tests.`);
    else logPass(`\n✓ All ${passes} tests passed.`)
}

async function test(label, cb) {
    try {
        await cb();
        passes += 1;
    } catch(e) {
        failures += 1;
        logFail(`Failed Test: "${label}", at ${e.message}\n`)
    }
}

function logFail(str) {
    console.error('\x1b[41m%s\x1b[0m', str);
}

function logPass(str) {
    console.log('\x1b[42m%s\x1b[0m', str);
}