const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { rollup } = require('rollup');

function esNombreSeguro(nombre, dirDestino) {
    // white list: solo letras, numeros, guiones y guiones bajos
    const regexAlfanumerico = /^[a-zA-Z0-9_-]+$/;
    if (!regexAlfanumerico.test(nombre)) {
        return false;
    }
    // normalizamos ruta
    const baseResuelta = path.resolve(dirDestino);
    const rutaFinal = path.resolve(dirDestino, nombre);
    return rutaFinal.startsWith(baseResuelta + path.sep);
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/compile') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
            try {
                const { chunkName, code } = JSON.parse(body);

                // validacion antes de tocar el disco o llamar a Rollup
                if (!esNombreSeguro(chunkName, 'dist')) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({
                        status: 'blocked',
                        message: 'Entrada rechazada por politica de seguridad: ruta invalida.'
                    }) + '\n');
                }

                if (code) {
                    fs.writeFileSync('src/index.js', code);
                }

                const bundle = await rollup({
                    input: { [chunkName]: 'src/index.js' }
                });

                await bundle.write({
                    dir: 'dist',
                    entryFileNames: '[name].js',
                    format: 'cjs'
                });

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
    console.log('API de empaquetado Rollup ( ENDURECIDA ) escuchando en el puerto 3000...');
});
