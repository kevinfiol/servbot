import assert from 'assert';
import { get as getCb } from 'http';
import { promisify } from 'util';
import servbot from './index.js';

const get = promisify(getCb);

let res;
let passes = 0;
let failures = 0;

// const server = servbot({
//   root: './example/',
//   reload: true,
//   fallback: 'index.html'
// });

// server.listen(8989);


console.log(`Tests Passed ✓: ${passes}`);
console.warn(`Tests Failed ✗: ${failures}`);

if (failures) logFail(`\n✗ Tests failed with ${failures} failing tests.`);
else logPass(`\n✓ All ${passes} tests passed.`)

function test(label, cb) {
    try {
        cb();
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