require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('clientReady', (c) => {
  console.log(`Logged in as ${c.user.tag}`);
});

client.on('messageCreate', (message) => {
  if (message.author.bot) return;

  if (message.content === '!hello') {
    message.reply('Hello! 👋');
  }
  if (message.content === '!ping') {
    message.reply('Pong! 🏓');
  }
});

// ✅ Uses token from .env file
client.login(process.env.TOKEN);