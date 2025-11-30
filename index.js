const OpenAI = require("openai");
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));


const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: 'sk-1262c99c3b4c4088aca175eb028f097e'
});

// Serve static files from the "public" directory


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.post("/", async (req, res) => {
    const userMessage = req.body.text;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    try {
        const stream = await openai.chat.completions.create({
            model: "deepseek-chat",
            stream: true,
            messages: [
                { role: "user", content: userMessage }
            ]
        });
        console.log(stream);
        

        for await (const chunk of stream) {
            const token = chunk.choices?.[0]?.delta?.content;
            console.log(token);
            

            if (token) {
                res.write(`data: ${token}\n\n`);
            }
        }

        res.write("data: [END]\n\n");
        res.end();

    } catch (err) {
        console.error(err);
        res.write(`data: ERROR: ${err.message}\n\n`);
        res.end();
    }
});
module.exports = app;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// app.listen(PORT, () => {
//     console.log(`Server is running at http://localhost:${PORT}`);
// });
