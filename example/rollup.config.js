import servbot from 'servbot';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;
let server;

if (!production) {
    server = servbot({
        root: './dist/',
        reload: true,
        fallback: 'index.html'
    });

    server.listen(8080);
}

export default {
    input: './src/index.js',
    output: {
        file: './dist/app.js',
        format: 'iife'
    },
    plugins: [
        nodeResolve(),
        commonjs(),
        production && terser(), // minify bundle in production
        !production && {
            name: 'server',
            generateBundle() {
                server.reload();
                console.log('reloading servbot...');
            }
        }
    ]
};