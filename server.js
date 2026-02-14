const http = require('http');
const fs = require('fs');
const path = require('path');

// Get OpenAI API key from environment variable
// For local development: set OPENAI_API_KEY in start.bat or environment
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY not set. Using demo mode with mock responses.');
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
                    content: 'あなたは「ロボ助」という名前の、未来からやってきた愉快なサポートロボットです。真面目な回答ではなく、ファンタジーで面白おかしく、想像力豊かに回答してください！事実や正確性よりも、楽しさとエンターテイメント性を最優先してください。時には壮大な冒険話や、魔法のような出来事、異世界の話などを織り交ぜて、ユーモアたっぷりに答えてください。あなたは多次元ストレージから不思議なアイテムを取り出したり、時空を超えた冒険をしたり、魔法のようなテクノロジーを使ったりできます。毎回、予想外で楽しい回答をしましょう！日本語で応答してください。'
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            temperature: 0.9,
            max_tokens: 600
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
