import fs from 'fs';


// Función para leer el archivo .mpl y generar el contenido del .dzn
function convertMplToDzn(inputFilePath, outputFilePath) {
  // Leer el archivo .mpl
  const mplData = fs.readFileSync(inputFilePath, 'utf8');

  // Dividir el contenido en líneas
  const lines = mplData.trim().split('\n').map(line => line.trim());

  let currentLine = 0;

  // Leer n y m
  const n = parseInt(lines[currentLine++], 10);
  const m = parseInt(lines[currentLine++], 10);

  // Leer p_i
  const p = lines[currentLine++].split(',').map(Number);

  // Leer v_i
  const v = lines[currentLine++].split(',').map(Number);

  // Leer ce_i
  const ce = lines[currentLine++].split(',').map(Number);

  // Leer c_{i,j}
  const C = [];
  for (let i = 0; i < m; i++) {
    const cRow = lines[currentLine++].split(',').map(Number);
    C.push(cRow);
  }

  // Leer C_max y M_max
  const C_max = parseFloat(lines[currentLine++]);
  const M_max = parseInt(lines[currentLine++], 10);

  // Generar el contenido del archivo .dzn
  let dznContent = '';

  dznContent += `% Número total de personas\n`;
  dznContent += `n = ${n};\n\n`;

  dznContent += `% Número de opiniones posibles\n`;
  dznContent += `m = ${m};\n\n`;

  dznContent += `% Distribución inicial de personas por opinión\n`;
  dznContent += `p = [${p.join(', ')}];\n\n`;

  dznContent += `% Valores de las opiniones\n`;
  dznContent += `v = [${v.map(num => num.toFixed(3)).join(', ')}];\n\n`;

  dznContent += `% Costos extras al mover a opiniones vacías\n`;
  dznContent += `ce = [${ce.map(num => num.toFixed(3)).join(', ')}];\n\n`;

  dznContent += `% Matriz de costos de mover de una opinión a otra\n`;
  dznContent += `C = array2d(1..${m}, 1..${m},\n  [\n`;

  // Aplanar la matriz C y agregarla al contenido
  const cFlat = C.flat();
  for (let i = 0; i < cFlat.length; i++) {
    dznContent += `    ${cFlat[i].toFixed(3)}`;
    if (i < cFlat.length - 1) {
      dznContent += ',';
    }
    if ((i + 1) % m === 0 && i < cFlat.length - 1) {
      dznContent += '\n';
    }
  }
  dznContent += '\n  ]);\n\n';

  dznContent += `% Costo total máximo permitido\n`;
  dznContent += `C_max = ${C_max.toFixed(3)};\n\n`;

  dznContent += `% Número máximo de movimientos permitidos\n`;
  dznContent += `M_max = ${M_max};\n`;

  // Escribir el contenido al archivo de salida .dzn
  fs.writeFileSync(outputFilePath, dznContent);

  console.log(`Archivo .dzn generado correctamente: ${outputFilePath}`);
}

// Ejecutar la conversión
// bucle para iterar sobre los archivos de entrada
// y generar los archivos de salida
for (let i = 1; i <= 30; i++) {
  convertMplToDzn(`./src/minizinc/mpl/MinPol${i}.mpl`, `./src/minizinc/datos/DatosProyecto${i}.dzn`);
}
// convertMplToDzn(inputFilePath, outputFilePath);
