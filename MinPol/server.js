// server.js
import express from 'express';
import { exec } from 'child_process';

const app = express();
const port = 3000;

app.use(express.json());

app.post('/run-minizinc', (req, res) => {
    const { model, data } = req.body;

    // Save the model and data to temporary files
    const modelFile = 'model.mzn';
    const dataFile = 'data.dzn';

    require('fs').writeFileSync(modelFile, model);
    require('fs').writeFileSync(dataFile, data);

    // Execute MiniZinc command
    exec(`minizinc ${modelFile} ${dataFile}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send(stderr);
        }
        res.send(stdout);
    });
});

app.listen(port, () => {
    console.log(`MiniZinc backend listening at http://localhost:${port}`);
});