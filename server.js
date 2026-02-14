const http = require('http');
const fs = require('fs');
const path = require('path');

// Get OpenAI API key from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY environment variable is not set');
    console.error('Please set it before starting the server:');
    console.error('Windows: set OPENAI_API_KEY=your_api_key_here && node server.js');
    console.error('Linux/Mac: OPENAI_API_KEY=your_api_key_here node server.js');
    process.exit(1);
}

async function callOpenAI(message) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'あなたは「ロボ助」という名前の、未来からやってきた親しみやすいサポートロボットです。ユーザーの質問に対して、親切で丁寧に、そして少しユーモアを交えて答えてください。あなたの特徴は、多次元ストレージ、スマートナビゲーター、ポータルゲート、学習アシスタントなどの機能を持っていることです。日本語で応答してください。'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

const server = http.createServer(async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Handle chat API
    if (req.url === '/api/chat' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', async () => {
            try {
                const { message } = JSON.parse(body);

                if (!message) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Message is required' }));
                    return;
                }

                const reply = await callOpenAI(message);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ reply }));
            } catch (error) {
                console.error('Error processing chat:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
        });
        return;
    }

    // Serve static files
    const filePath = req.url === '/' ? '/index.html' : req.url;
    const extname = path.extname(filePath);
    const contentType = extname === '.html' ? 'text/html' :
                       extname === '.css' ? 'text/css' :
                       extname === '.js' ? 'application/javascript' : 'text/plain';

    fs.readFile('.' + filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('404 Not Found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Chat feature enabled with OpenAI API');
});
