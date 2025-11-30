const chat = document.getElementById("chat-container");
const input = document.getElementById("userInput");

function scrollToBottom() {
    chat.scrollTop = chat.scrollHeight;
}

async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // Add user bubble
    const userMsg = document.createElement("div");
    userMsg.className = "msg user-msg";
    userMsg.textContent = text;
    chat.appendChild(userMsg);

    input.value = "";
    scrollToBottom();

    // Add AI bubble
    const aiMsg = document.createElement("div");
    aiMsg.className = "msg ai-msg";
    chat.appendChild(aiMsg);

    scrollToBottom();

    // STREAM REQUEST
    const response = await fetch("/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text
        })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let buffer = "";

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
            const chunk = decoder.decode(value);
            buffer += chunk;
            
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const data = line.replace("data: ", "").trim();

                    if (data === "[END]") {
                        return;
                    }

                    // Handle the token based on its content
                    if (data === "") {
                        // Empty line means newline
                        aiMsg.innerHTML += '<br><br>';
                    } else if (data.match(/^[.,!?;:)]$/)) {
                        // Punctuation - add directly without space
                        aiMsg.innerHTML += data;
                    } else if (aiMsg.innerHTML === "") {
                        // First word - add without space
                        aiMsg.innerHTML += data;
                    } else {
                        // Regular word - add with space before
                        aiMsg.innerHTML += ' ' + data;
                    }
                    
                    scrollToBottom();
                }
            }
        }
    }
}



// Simple test AI response generator (replace with your backend)
function generateAIResponse(userText) {
    return userText;
}