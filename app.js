const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { spawn } = require('child_process');

const PORT = process.env.PORT || 3000;

// Parse incoming JSON data
app.use(bodyParser.json());

// Serve the HTML and other static files
app.use(express.static('public'));

// Serve the HTML page when the root URL is accessed
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/Test.html');
});

// Handle code execution
app.post('/execute', (req, res) => {
    const { code, input } = req.body;

    // Create a child process to execute Python code
    const pythonProcess = spawn('python', ['-c', code]);

    // Send input to the Python process if provided
    if (input) {
        pythonProcess.stdin.write(input);
        pythonProcess.stdin.end();
    }

    let output = '';
    let error = '';

    // Capture Python output
    pythonProcess.stdout.on('data', data => {
        output += data.toString();
    });

    // Capture Python errors
    pythonProcess.stderr.on('data', data => {
        error += data.toString();
    });

    // Handle Python process completion
    pythonProcess.on('close', code => {
        if (code === 0) {
            res.json({ output });
        } else {
            res.json({ error }); // Send the error message in the response
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});