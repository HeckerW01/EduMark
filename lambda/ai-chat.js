const { spawn } = require('child_process');
const path = require('path');

// Initialize Gemma process
let gemmaProcess = null;
let isInitializing = false;
let initPromise = null;

/**
 * Initialize the Gemma 3 27B process
 */
async function initializeGemma() {
    if (gemmaProcess) return;
    if (isInitializing) return initPromise;

    isInitializing = true;
    initPromise = new Promise((resolve, reject) => {
        try {
            console.log('Initializing Gemma process...');
            gemmaProcess = spawn('python3', [
                path.join(__dirname, 'run_gemma3_27b.py')
            ]);

            gemmaProcess.stdout.on('data', (data) => {
                console.log(`Gemma process output: ${data}`);
                if (data.toString().includes('Model loaded successfully')) {
                    isInitializing = false;
                    resolve();
                }
            });

            gemmaProcess.stderr.on('data', (data) => {
                console.error(`Gemma process error: ${data}`);
            });

            gemmaProcess.on('close', (code) => {
                console.log(`Gemma process exited with code ${code}`);
                gemmaProcess = null;
                isInitializing = false;
                initPromise = null;
            });

            // Set a timeout for initialization
            setTimeout(() => {
                if (isInitializing) {
                    isInitializing = false;
                    reject(new Error('Initialization timeout'));
                }
            }, 30000);

        } catch (error) {
            isInitializing = false;
            initPromise = null;
            reject(error);
        }
    });

    return initPromise;
}

/**
 * Query Gemma model
 */
async function queryGemma(prompt) {
    if (!gemmaProcess) {
        await initializeGemma();
    }

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            reject(new Error('Gemma query timeout'));
        }, 30000);

        gemmaProcess.stdin.write(JSON.stringify({ prompt }) + '\n');
        
        gemmaProcess.stdout.once('data', (data) => {
            clearTimeout(timeout);
            try {
                const response = JSON.parse(data.toString());
                resolve(response.text);
            } catch (error) {
                reject(error);
            }
        });
    });
}

/**
 * Lambda handler
 */
exports.handler = async (event) => {
    // Handle OPTIONS request for CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: ''
        };
    }

    try {
        // Parse request body
        const body = JSON.parse(event.body);
        const { message } = body;

        if (!message) {
            return {
                statusCode: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type'
                },
                body: JSON.stringify({ error: 'No message provided' })
            };
        }

        // Generate response using Gemma
        const response = await queryGemma(message);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ response })
        };

    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST,OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ error: 'Failed to get response from AI' })
        };
    }
}; 