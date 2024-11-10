// server.js
import express from 'express';
import { exec } from 'child_process';
import multer from 'multer';
import cors from 'cors';
import { convertDefaultImpFiles2ToDzn  } from './src/minizinc/scripts/mpl_to_dzn.js';
import { runMiniZinc } from './src/minizinc/scripts/run_minizinc_storing.js';

const app = express();
const port = 3000;
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/run-minizinc', upload.single('file'), (req, res) => {
    const { model, data } = req.body;
    console.log(req);
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({ message: 'File uploaded successfully', file: req.file });

	if (false) {
		const convertedFilePath = convertDefaultImpFiles2ToDz("", "");
        if (convertedFilePath) {
			runMiniZinc(convertedFilePath);
		}
	}
    // Save the model and data to temporary files
    // const modelFile = 'model.mzn';
    // const dataFile = 'data.dzn';

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
