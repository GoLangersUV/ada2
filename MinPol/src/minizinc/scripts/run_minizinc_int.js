// scripts/run_minizinc.js

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import ProgressBar from 'progress';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Necessary for ES modules to get __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const MODEL_PATH = path.join(__dirname, '..', 'Proyecto_int.mzn');
const DATA_DIR = path.join(__dirname, '..', 'datos');
const SOLVER = 'coin-bc'; // You can change the solver if needed
const TIMEOUT = 30000; // 5 minutes in milliseconds

// Function to execute MiniZinc for a single data file
function runMiniZinc(dataFile) {
    return new Promise((resolve, reject) => {
        const dataPath = path.join(DATA_DIR, dataFile);
        console.log(chalk.blue(`\nExecuting with data file: ${dataFile}`));

        const timeLimitSeconds = TIMEOUT-10000; // e.g., 300 for 5 minutes
        const minizincArgs = ['--solver', SOLVER, '--time-limit', timeLimitSeconds.toString(), MODEL_PATH, dataPath];
        const minizinc = spawn('minizinc', minizincArgs);

        let output = '';
        let errorOutput = '';
        let timedOut = false;

        // Capture stdout
        minizinc.stdout.on('data', (data) => {
            output += data.toString();
        });

        // Capture stderr
        minizinc.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        // Handle process exit
        minizinc.on('close', (code) => {
            clearTimeout(timer);
            if (timedOut) {
                resolve(output); // Return partial output
            } else if (code === 0) {
                resolve(output);
            } else {
                reject(new Error(`Process exited with code ${code}: ${errorOutput}`));
            }
        });

        // Handle errors
        minizinc.on('error', (err) => {
            clearTimeout(timer);
            reject(err);
        });

        // Implement timeout
        const timer = setTimeout(() => {
            timedOut = true;
            minizinc.kill('SIGINT'); // Gracefully terminate
        }, TIMEOUT);
    });
}

// Main function to iterate over all data files
async function main() {
    try {
        const files = fs.readdirSync(DATA_DIR).filter(file => file.endsWith('.dzn'));
        const totalFiles = files.length;
        const bar = new ProgressBar('Processing [:bar] :current/:total :etas', {
            total: totalFiles,
            width: 40,
            incomplete: ' ',
        });

        for (const file of files) {
            try {
                const result = await runMiniZinc(file);
                // You can process the result here or save it to a file
                console.log(chalk.green(`\nResult for ${file}:\n${result}`));
            } catch (err) {
                console.log(chalk.red(`\nError with ${file}: ${err.message}`));
            }
            bar.tick();
        }

        console.log(chalk.yellow('\nAll executions completed.'));
    } catch (err) {
        console.error(chalk.red(`\nFatal error: ${err.message}`));
    }
}

main();
