// server.js
import express from 'express';
import { exec } from 'child_process';
import multer from 'multer';
import cors from 'cors';
import { convertMplToDzn  } from './src/minizinc/scripts/mpl_to_dzn.js';
import { runMiniZinc } from './src/minizinc/scripts/run_minizinc_storing.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Necessary for ES modules to get __dirname
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
		const convertedFilePath = convertMplToDzn(uploadedFilePath, `${uploadedFilePath}.dzn`);
        console.log(`convertedFilePath ${convertedFilePath}`);
		if (convertedFilePath) {
		 	const result = await runMiniZinc(convertedFilePath, originalname);
			console.log(`result ${result}`);

			fs.readFile(result, 'utf8', (err, data) => {
				if (err) {
					console.error('Error reading the JSON file:', err);
					return res.status(500).json({ error: 'Failed to read data' });
				}
				try {
					const jsonData = JSON.parse(data);
					res.json(jsonData); 
				} catch (parseError) {
					console.error('Error parsing JSON:', parseError);
					res.status(500).json({ error: 'Failed to parse data' });
				}
			});
		} 
	} else {
		return res.status(400).json({ error: 'No file uploaded' });
	}   
    
    if (file) {
        const originalFileName = file.originalname;
        const uploadedFilePath = file.path;
        const baseFilename = path.parse(uploadedFilePath).name;
        const convertedFilePath = convertMplToDzn(uploadedFilePath, `${uploadedFilePath}.dzn`);
        console.log(`convertedFilePath ${convertedFilePath}`);
        if (convertedFilePath) {
            const result = await runMiniZinc(convertedFilePath);
            console.log(`result ${result}`);

            res.json(
                { 
                    fileName: baseFilename 
                }
            );
        } 
    } else {
        return res.status(400).json({ error: 'No file uploaded' });
    }   
});


//End point to get the results
app.get('/results', (req, res) => {
    const jsonPath = path.join(RESULTS_DIR, 'consolidated_results.json');
    if (fs.existsSync(jsonPath)) {
        const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
        res.json(jsonData);
    } else {
        res.status(404).json({ error: 'No results found' });
    }
});

app.listen(port, () => {
    console.log(`MiniZinc backend listening at http://localhost:${port}`);
});
