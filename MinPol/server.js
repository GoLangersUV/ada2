// server.js
import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { convertMplToDzn } from './src/minizinc/scripts/mpl_to_dzn.js';
import { runMiniZinc } from './src/minizinc/scripts/run_minizinc_storing.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Necesario para ES modules para obtener __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });
const RESULTS_DIR = path.join(__dirname, 'src', 'minizinc', 'results');

app.use(cors());
app.use(express.json());

app.post('/run-minizinc', upload.single('file'), async (req, res) => {
    const file = req.file;
    
    if (file) {
        const { originalname } = file;
        const uploadedFilePath = file.path;
        const baseFilename = path.parse(uploadedFilePath).name;
        const convertedFilePath = convertMplToDzn(uploadedFilePath, `${uploadedFilePath}.dzn`);
        console.log(`convertedFilePath ${convertedFilePath}`);
        
        if (convertedFilePath) {
            const result = await runMiniZinc(convertedFilePath, originalname);
            console.log(`result ${result}`);

            // Asegúrate de que inputFile está incluido en la respuesta
            res.json({
                success: true,
                message: "Upload complete!",
                payload: {
                    fileName: baseFilename,
                    inputFile: originalname
                }
            });
        } else {
            res.status(500).json({ 
                success: false,
                message: 'Error al convertir el archivo' 
            });
        }
    } else {
        res.status(400).json({ 
            success: false,
            message: 'No file uploaded' 
        });
    }   
});

// Endpoint para obtener los resultados
app.get('/results', (req, res) => {
    const jsonPath = path.join(RESULTS_DIR, 'consolidated_results.json');
    if (fs.existsSync(jsonPath)) {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        res.json(jsonData);
    } else {
        res.status(404).json({ 
            success: false,
            message: 'No results found' 
        });
    }
});

app.listen(port, () => {
    console.log(`MiniZinc backend listening at http://localhost:${port}`);
});
