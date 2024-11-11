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
const RESULTS_DIR = path.join(__dirname, '..', 'results');
const SOLVER = 'coin-bc';
const TIMEOUT = 30000;

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

// Function to save results to files
function saveResults(filename, result, isError = false) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const baseFilename = path.parse(filename).name;
    
    // Save individual result as text file
    const txtFilename = path.join(RESULTS_DIR, `${baseFilename}_${timestamp}.txt`);
    fs.writeFileSync(txtFilename, result);

    // Update or create consolidated JSON
    const jsonPath = path.join(RESULTS_DIR, 'consolidated_results_int.json');
    let consolidated = {};
    if (fs.existsSync(jsonPath)) {
        consolidated = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    }

    consolidated[baseFilename] = {
        timestamp: new Date().toISOString(),
        result: result,
        isError: isError,
        inputFile: filename
    };

    fs.writeFileSync(jsonPath, JSON.stringify(consolidated, null, 2));
}

// Function to execute MiniZinc for a single data file
function runMiniZinc(dataFile) {
    return new Promise((resolve, reject) => {
        const dataPath = path.join(DATA_DIR, dataFile);
        console.log(chalk.blue(`\nExecuting with data file: ${dataFile}`));

        const timeLimitSeconds = TIMEOUT-10000;
        const minizincArgs = ['--solver', SOLVER, '--time-limit', timeLimitSeconds.toString(), MODEL_PATH, dataPath];
        const minizinc = spawn('minizinc', minizincArgs);

        let output = '';
        let errorOutput = '';
        let timedOut = false;

        minizinc.stdout.on('data', (data) => {
            output += data.toString();
        });

        minizinc.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        minizinc.on('close', (code) => {
            clearTimeout(timer);
            if (timedOut) {
                const timeoutMsg = `Execution timed out after ${TIMEOUT}ms\nPartial output: ${output}`;
                saveResults(dataFile, timeoutMsg, true);
                resolve(timeoutMsg);
            } else if (code === 0) {
                saveResults(dataFile, output);
                resolve(output);
            } else {
                const errorMsg = `Process exited with code ${code}: ${errorOutput}`;
                saveResults(dataFile, errorMsg, true);
                reject(new Error(errorMsg));
            }
        });

        minizinc.on('error', (err) => {
            clearTimeout(timer);
            saveResults(dataFile, err.message, true);
            reject(err);
        });

        const timer = setTimeout(() => {
            timedOut = true;
            minizinc.kill('SIGINT');
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
                console.log(chalk.green(`\nResult for ${file} saved successfully`));
            } catch (err) {
                console.log(chalk.red(`\nError with ${file}: ${err.message}`));
            }
            bar.tick();
        }

        console.log(chalk.yellow('\nAll executions completed. Results saved in the "results" directory.'));
    } catch (err) {
        console.error(chalk.red(`\nFatal error: ${err.message}`));
    }
}

main();