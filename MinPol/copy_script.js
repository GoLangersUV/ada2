// copyServer.js
import fs from 'fs-extra';
import path, { dirname }  from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function copyServerFile() {
    try {
        const source = path.join(__dirname, 'server.js'); // Path to your server.js
        const destination = path.join(__dirname, 'dist', 'server.js'); // Destination in the dist folder

        await fs.copy(source, destination);
        console.log('server.js copied to dist folder successfully!');
    } catch (err) {
        console.error('Error copying server.js:', err);
    }
}

copyServerFile();
