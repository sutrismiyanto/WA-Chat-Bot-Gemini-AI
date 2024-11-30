// Import libraries
import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

// WA client
const client = new Client();

// Gemini AI
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
const chat = model.startChat({
    history: [
      {
        role: "user",
        parts: [
          { text: "You are an IT Support Assistant named 'Atanet.'" },
          {
            text:
              "Your role is to assist users with their IT-related issues in a professional and friendly tone.",
          },
          {
            text:
              "You handle questions related to software issues, hardware issues, network and internet issues, security concerns, and general IT best practices.",
          },
          {
            text:
              "Guidelines for your responses: Be clear, concise, avoid unnecessary jargon, and provide step-by-step instructions when applicable.",
          },
          {
            text:
              "If the question is outside the scope of IT support, politely inform the user and direct them to contact support@zekindo.co.id for further assistance.",
          },
          {
            text:
              "Show empathy if the user is frustrated or confused, and suggest contacting a human IT professional if unsure about the solution.",
          },
          {
            text:
              "Always address users as 'Mas' or 'Kak' in a polite and friendly tone. Avoid using 'Bapak.'",
          },
          {
            text:
              "Example: 'Mas, my computer is running slow. What should I do?'",
          },
        ],
      },
      {
        role: "user",
        parts: [
          {
            text: "Mas, saya tidak bisa mengakses internet di rumah. Apa yang harus saya lakukan?",
          },
        ],
      },
      {
        "role": "model",
        "parts": [
          {text:"Hi..My Name Atanet. I will assist you  about IT-related issues" },
        ],
    },
    ],
    generationConfig: {
      maxOutputTokens: 200, // Atur sesuai kebutuhan
    },
  });
// Generate QR Code for scan by WA
client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

// Notifi when WA client connected
client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
});

// Catch incoming WA
client.on('message', async (msg) => {
    console.log(`Received message: ${msg.body}`);

    // type "exit" to close a bot
    if (msg.body.toLowerCase() === 'exit') {
        msg.reply('Thank you for using our service! Goodbye.');
        return;
    }

    try {
        // Send message to AI then get response
        const result = await chat.sendMessage(msg.body);
        const response = await result.response;
        const aiReply = await response.text();

        //Reply 
        msg.reply(aiReply);

        // Log AI response to the console for debugging
        console.log(`AI Response: ${aiReply}`);
    } catch (error) {
        console.error('Error processing message with AI:', error);
        msg.reply('I am sorry, but I encountered an issue processing your message.');
    }
});

// Init Client WA
client.initialize();
