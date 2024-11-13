import { exec } from "child_process";

// Ejecuta comandos en una terminal
function runCommand(command, options = {}) {
  const process = exec(command, options);

  process.stdout.on("data", (data) => console.log(data.toString()));
  process.stderr.on("data", (data) => console.error(data.toString()));

  process.on("close", (code) => {
    if (code !== 0) {
      console.error(`Command failed with code: ${code}`);
    }
  });

  return process;
}

// Paso 1: Instalar dependencias
console.log("Instalando dependencias...");
runCommand("npm i").on("close", () => {
  console.log("Dependencias instaladas. Iniciando procesos...");

  // Paso 2: Ejecutar servidor
  runCommand("node server.js");
  console.log("Servidor iniciado.");

  // Paso 3: Ejecutar frontend
  const frontend = runCommand("npm run dev");

  let localhostUrl = null;

  // Captura la salida del comando npm run dev para extraer la URL generada por Vite
  frontend.stdout.on("data", (data) => {
    const output = data.toString();
    if (!localhostUrl) {
      const match = output.match(/http:\/\/localhost:\d+/); // Busca la URL con el puerto
      if (match) {
        localhostUrl = match[0];
        console.log(`Servidor de desarrollo en: ${localhostUrl}`);
      }
    }
  });
});
