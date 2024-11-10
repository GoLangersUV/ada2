// server.js
import express from 'express';
import { exec } from 'child_process';
import multer from 'multer';
import cors from 'cors';
import { convertMplToDzn  } from './src/minizinc/scripts/mpl_to_dzn.js';
import { runMiniZinc } from './src/minizinc/scripts/run_minizinc_storing.js';

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/run-minizinc', upload.single('file'), (req, res) => {

	const file = req.file;
	
	if (file) {
		console.log(file);
		const { fileName } = file.originalname;
		const uploadedFilePath = file.path;
		const convertedFilePath = convertMplToDzn(uploadedFilePath, `${uploadedFilePath}.dzn`);
        console.log(`convertedFilePath ${convertedFilePath}`);
		if (convertedFilePath) {
		 	runMiniZinc(convertedFilePath);
		} 
	} else {
		return res.status(400).json({ error: 'No file uploaded' });
	}   
    
   


    // require('fs').writeFileSync(modelFile, model);
    // require('fs').writeFileSync(dataFile, data);

    // // Execute MiniZinc command
    // exec(`minizinc ${modelFile} ${dataFile}`, (error, stdout, stderr) => {
    //     if (error) {
    //         console.error(`exec error: ${error}`);
    //         return res.status(500).send(stderr);
    //     }
    //     res.send(stdout);
    // })
	;
});

app.listen(port, () => {
    console.log(`MiniZinc backend listening at http://localhost:${port}`);
});
