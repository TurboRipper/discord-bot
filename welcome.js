// ============================================
//  Ghost Bot — Creative Gaming Welcome Module
//  Style: Gaming / Hype 🎮
//  Features: Avatar | Rules Reminder | Anime/Gaming GIF
// ============================================

const { EmbedBuilder } = require('discord.js');

// ─── CONFIG ────────────────────────────────────────────────────────────────

const RULES_CHANNEL = '#rules';       // 🔧 Change to your rules channel name
const ROLES_CHANNEL = '#get-roles';   // 🔧 Change to your roles channel (optional)

// ─── RANDOM ANIME / GAMING GIFs ────────────────────────────────────────────
// Add or remove GIF URLs as you like!

const WELCOME_GIFS = [
  'https://media.tenor.com/9pze0lhHCKEAAAAC/welcome-anime.gif',
  'https://media.tenor.com/4KvdQROhSesAAAAC/welcome-hi.gif',
  'https://media.tenor.com/m3hBRJ3QnYkAAAAd/yoo-anime.gif',
  'https://media.tenor.com/R-RGPqyEfHYAAAAC/welcome.gif',
  'https://media.tenor.com/SWMHQjI0hecAAAAC/genshin-welcome.gif',
  'https://media.tenor.com/Q1k3JgVHOTcAAAAC/gaming-anime.gif',
  'https://media.tenor.com/euYa7J9sn7kAAAAC/gamer-anime.gif',
  'https://media.tenor.com/NqLrpDeMiagAAAAC/welcome-nier.gif',
];

// ─── HYPE MESSAGES ─────────────────────────────────────────────────────────

const HYPE_MESSAGES = [
  '🔥 A new legend has entered the arena!',
  '⚡ A new challenger has appeared!',
  '🎮 Player 2 has joined the game!',
  '🚀 A new warrior has arrived!',
  '💥 The server just got stronger!',
  '🏆 A new champion has spawned!',
  '🎯 A new player has loaded in!',
  '👾 A wild gamer has appeared!',
];

// ─── HELPER ────────────────────────────────────────────────────────────────

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── WELCOME HANDLER ───────────────────────────────────────────────────────

async function sendWelcome(member) {
  const guild = member.guild;
  const channel = guild.systemChannel;
  if (!channel) return;

  const gif = getRandom(WELCOME_GIFS);
  const hype = getRandom(HYPE_MESSAGES);
  const memberCount = guild.memberCount;

  const embed = new EmbedBuilder()
    .setColor(0xFF4500) // Hype orange-red
    .setTitle(`${hype}`)
    .setDescription(
      `> Welcome to **${guild.name}**, ${member}!\n` +
      `> You are our **#${memberCount}** member. Let's gooo! 🎉`
    )
    .setThumbnail(member.user.displayAvatarURL({ size: 256, dynamic: true }))
    .setImage(gif)
    .addFields(
      {
        name: '📜 Read the Rules',
        value: `Head over to ${RULES_CHANNEL} to get started and avoid getting kicked!`,
        inline: false,
      },
      {
        name: '🎮 Get Your Roles',
        value: `Visit ${ROLES_CHANNEL} to pick your roles and unlock channels!`,
        inline: false,
      }
    )
    .setFooter({
      text: `${guild.name} • Welcome!`,
      iconURL: guild.iconURL({ dynamic: true }),
    })
    .setTimestamp();

  await channel.send({
    content: `🔔 Everyone welcome ${member} to the server!`,
    embeds: [embed],
  });
}

// ─── EXPORT ────────────────────────────────────────────────────────────────

module.exports = { sendWelcome };
