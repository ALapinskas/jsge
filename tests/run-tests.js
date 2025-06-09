// run-tests.js
import { exec, spawn } from 'child_process';

// Function to sleep for a specified duration
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
    
    const server = spawn('http-server', ["./", '-c-1', '-p', '9000'], {
        stdio: 'inherit', // Inherit stdio to see output in the console
        shell: true // Use shell to execute the command
    });

    // Sleep for 3 seconds
    await sleep(3000);

    // Start the regression tests
    const testProcess = exec('node ./tests/regression.js');
    

    testProcess.stdout.on('data', (data) => {
        console.log(`Test Output: ${data}`);
    });

    testProcess.stderr.on('data', (data) => {
        console.error(`Test Error: ${data}`);
        server.kill();
    });

    testProcess.on('exit', (code) => {
        console.log(`Test script exited with code ${code}`);
        server.kill();
        // Determine the command to terminate Node.js processes based on the OS
        const command = process.platform === 'win32' ? 'taskkill /f /im node.exe' : 'pkill node';

        exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error terminating Node.js processes: ${stderr}`);
        } else {
            console.log(`Terminated Node.js processes: ${stdout}`);
        }
        });
    });
})();