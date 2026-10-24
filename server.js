const http = require('http');
const fs = require('fs');
const { exec } = require('child_process');
const { rollup } = require('rollup');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/compile') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { chunkName, code } = JSON.parse(body);

                if (code) {
                    fs.writeFileSync('src/index.js', code);
                }

                // Compilación vulnerable a Path Traversal
                const bundle = await rollup({
                    input: {
                        [chunkName]: 'src/index.js'
                    }
                });

                await bundle.write({
                    dir: 'dist',
                    entryFileNames: '[name].js',
                    format: 'cjs'
                });

                // Ejecución de la tarea post-compilación
                exec('node /opt/servicio/post-build.js', (err, stdout) => {
                    if (stdout) console.log('[Servicio Interno]:', stdout.trim());
                });

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'ok', message: 'Empaquetado completado' }) + '\n');
            } catch (err) {
                console.error('[Error]:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'error', message: err.message }) + '\n');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Ruta no encontrada\n');
    }
});

server.listen(3000, '0.0.0.0', () => {
    console.log('API de empaquetado Rollup escuchando en el puerto 3000...');
});
