import { app, BrowserWindow } from 'electron';
import path from 'path';
import { exec } from 'child_process';
const __dirname = path.dirname(new URL(import.meta.url).pathname);

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
        //    preload: path.join(__dirname, 'preload.js'), // Optional: for security
            enableRemoteModule: false,
            nodeIntegration: true, // Enable Node.js integration
            contextIsolation: false, // Set to true for better security
            allowRunningInsecureContent: true,
            nodeIntegration: true // Use with caution
        },
    });

    //mainWindow.loadFile(path.join(__dirname, 'build', 'index.html'));

    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));

    // Open the DevTools (optional)
    //mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
    // Start the Node.js server
    exec('node server.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error starting server: ${error}`);
            return;
        }
        console.log(`Server output: ${stdout}`);
    });

    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
