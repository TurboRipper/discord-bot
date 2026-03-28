// ============================================
//  Ghost Bot — Auto-Moderation Module
//  Features: Bad Word Filter | Anti-Spam | Auto-Warn & Auto-Kick
// ============================================

const { EmbedBuilder, PermissionsBitField } = require('discord.js');

// ─── CONFIG ────────────────────────────────────────────────────────────────

const BAD_WORDS = ['Bitch', 'Lawde', 'Fuck You']; // 🔧 Add your words here

const SPAM_CONFIG = {
  maxMessages: 5,       // Max messages allowed...
  timeWindow: 5000,     // ...within this ms window (5 seconds)
};

const WARN_CONFIG = {
  warnLimit: 3,         // Warns before kick
  kickLimit: 5,         // Kicks before ban (optional, see below)
};

const LOG_CHANNEL_NAME = 'mod-logs'; // 🔧 Set your log channel name

// ─── STORAGE (in-memory) ───────────────────────────────────────────────────

const warnings = new Map();   // userId -> warn count
const spamTracker = new Map(); // userId -> [timestamps]

// ─── HELPERS ───────────────────────────────────────────────────────────────

function getLogChannel(guild) {
  return guild.channels.cache.find(c => c.name === LOG_CHANNEL_NAME);
}

async function sendLog(guild, embed) {
  const logChannel = getLogChannel(guild);
  if (logChannel) await logChannel.send({ embeds: [embed] });
}

async function warnUser(member, reason, guild) {
  const id = member.id;
  const current = warnings.get(id) || 0;
  const newCount = current + 1;
  warnings.set(id, newCount);

  // DM the user
  try {
    await member.send(`⚠️ You have been warned in **${guild.name}**.\n**Reason:** ${reason}\n**Warnings:** ${newCount}/${WARN_CONFIG.warnLimit}`);
  } catch (_) {}

  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('⚠️ Auto-Warn Issued')
    .addFields(
      { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
      { name: 'Reason', value: reason, inline: true },
      { name: 'Total Warnings', value: `${newCount}`, inline: true }
    )
    .setTimestamp();

  await sendLog(guild, embed);

  // Auto-kick if warn limit reached
  if (newCount >= WARN_CONFIG.warnLimit) {
    await kickUser(member, `Reached ${WARN_CONFIG.warnLimit} warnings`, guild);
    warnings.set(id, 0); // Reset warnings after kick
  }
}

async function kickUser(member, reason, guild) {
  if (!member.kickable) return;

  try {
    await member.send(`🚫 You have been **kicked** from **${guild.name}**.\n**Reason:** ${reason}`);
  } catch (_) {}

  await member.kick(reason);

  const embed = new EmbedBuilder()
    .setColor('#FF0000')
    .setTitle('🚫 Auto-Kick Executed')
    .addFields(
      { name: 'User', value: `${member.user.tag} (${member.id})`, inline: true },
      { name: 'Reason', value: reason, inline: true }
    )
    .setTimestamp();

  await sendLog(guild, embed);
}

// ─── MAIN AUTO-MOD HANDLER ─────────────────────────────────────────────────

async function handleAutoMod(message) {
  // Ignore bots and users with Manage Messages permission (mods/admins)
  if (message.author.bot) return;
  if (message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

  const content = message.content.toLowerCase();
  const member = message.member;
  const guild = message.guild;

  // ── 1. BAD WORD FILTER ──────────────────────────────────────────────────
  const foundBadWord = BAD_WORDS.find(word => content.includes(word));
  if (foundBadWord) {
    await message.delete().catch(() => {});
    const reply = await message.channel.send(`🚫 ${member}, that language isn't allowed here!`);
    setTimeout(() => reply.delete().catch(() => {}), 5000);
    await warnUser(member, `Used a banned word: "${foundBadWord}"`, guild);
    return; // Don't double-check spam on same message
  }

  // ── 2. ANTI-SPAM ────────────────────────────────────────────────────────
  const now = Date.now();
  const userId = member.id;

  if (!spamTracker.has(userId)) spamTracker.set(userId, []);
  const timestamps = spamTracker.get(userId);

  // Keep only timestamps within the time window
  const recent = timestamps.filter(t => now - t < SPAM_CONFIG.timeWindow);
  recent.push(now);
  spamTracker.set(userId, recent);

  if (recent.length >= SPAM_CONFIG.maxMessages) {
    // Delete recent spam messages
    try {
      const fetched = await message.channel.messages.fetch({ limit: 10 });
      const spamMsgs = fetched.filter(m => m.author.id === userId);
      await message.channel.bulkDelete(spamMsgs).catch(() => {});
    } catch (_) {}

    spamTracker.set(userId, []); // Reset tracker

    const reply = await message.channel.send(`🛑 ${member}, slow down! You're sending messages too fast.`);
    setTimeout(() => reply.delete().catch(() => {}), 5000);
    await warnUser(member, 'Spamming messages', guild);
  }
}

// ─── MOD COMMANDS ──────────────────────────────────────────────────────────

async function handleModCommands(message) {
  if (!message.content.startsWith('!')) return;
  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Only mods/admins can use these
  if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

  // !warns @user — Check a user's warnings
  if (command === 'warns') {
    const target = message.mentions.members.first();
    if (!target) return message.reply('Please mention a user. Usage: `!warns @user`');
    const count = warnings.get(target.id) || 0;
    message.reply(`⚠️ **${target.user.tag}** has **${count}** warning(s).`);
  }

  // !clearwarns @user — Clear a user's warnings
  if (command === 'clearwarns') {
    const target = message.mentions.members.first();
    if (!target) return message.reply('Please mention a user. Usage: `!clearwarns @user`');
    warnings.set(target.id, 0);
    message.reply(`✅ Warnings cleared for **${target.user.tag}**.`);
  }

  // !warn @user [reason] — Manually warn a user
  if (command === 'warn') {
    const target = message.mentions.members.first();
    if (!target) return message.reply('Please mention a user. Usage: `!warn @user [reason]`');
    const reason = args.slice(1).join(' ') || 'No reason provided';
    await warnUser(target, reason, message.guild);
    message.reply(`⚠️ **${target.user.tag}** has been warned. Reason: ${reason}`);
  }
}

// ─── EXPORTS ───────────────────────────────────────────────────────────────

module.exports = { handleAutoMod, handleModCommands };