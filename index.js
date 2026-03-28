const { sendWelcome } = require('./welcome');

const { handleAutoMod, handleModCommands } = require('./automod');
require('dotenv').config();

const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

client.once('clientReady', (c) => {
  console.log(`Logged in as ${c.user.tag} ✅`);
});

// ─── WELCOME NEW MEMBERS ───────────────────────────
client.on('guildMemberAdd', async (member) => {
  await sendWelcome(member);
});

// ─── ALL COMMANDS ──────────────────────────────────
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const args = message.content.trim().split(/ +/);
  const command = args[0].toLowerCase();

  // ── BASIC ────────────────────────────────────────
  if (command === '/hello') {
    message.reply('Hello! 👋');
  }

  if (command === '/ping') {
    message.reply(`Pong! 🏓 Latency: ${Date.now() - message.createdTimestamp}ms`);
  }

  // ── FUN COMMANDS ─────────────────────────────────
  if (command === '/joke') {
    const jokes = [
      'Why do programmers prefer dark mode? Because light attracts bugs! 🐛',
      'Why did the developer go broke? Because he used up all his cache! 💸',
      'What do you call a fish without eyes? A fsh! 🐟',
      'Why can\'t you trust an atom? Because they make up everything! ⚛️',
      'I told my wife she should embrace her mistakes. She gave me a hug! 🤗'
    ];
    const random = jokes[Math.floor(Math.random() * jokes.length)];
    message.reply(random);
  }

  if (command === '/8ball') {
    const question = args.slice(1).join(' ');
    if (!question) return message.reply('❓ Please ask a question! e.g. `/8ball Will I win?`');
    const answers = [
      '✅ Yes, definitely!',
      '✅ It is certain!',
      '✅ Without a doubt!',
      '❓ Maybe...',
      '❓ Ask again later.',
      '❓ Cannot predict now.',
      '❌ Don\'t count on it.',
      '❌ My sources say no.',
      '❌ Very doubtful.'
    ];
    const answer = answers[Math.floor(Math.random() * answers.length)];
    message.reply(`🎱 **Question:** ${question}\n**Answer:** ${answer}`);
  }

  if (command === '/coinflip') {
    const result = Math.random() < 0.5 ? '🪙 Heads!' : '🪙 Tails!';
    message.reply(result);
  }

  if (command === '/roll') {
    const max = parseInt(args[1]) || 6;
    const result = Math.floor(Math.random() * max) + 1;
    message.reply(`🎲 You rolled: **${result}** (out of ${max})`);
  }

  // ── INFO COMMANDS ─────────────────────────────────
  if (command === '/serverinfo') {
    const guild = message.guild;
    const embed = new EmbedBuilder()
      .setTitle(`📊 ${guild.name} Server Info`)
      .setThumbnail(guild.iconURL())
      .addFields(
        { name: '👑 Owner', value: `<@${guild.ownerId}>`, inline: true },
        { name: '👥 Members', value: `${guild.memberCount}`, inline: true },
        { name: '💬 Channels', value: `${guild.channels.cache.size}`, inline: true },
        { name: '🎭 Roles', value: `${guild.roles.cache.size}`, inline: true },
        { name: '📅 Created', value: guild.createdAt.toDateString(), inline: true }
      )
      .setColor(0x5865F2);
    message.reply({ embeds: [embed] });
  }

  if (command === '/userinfo') {
    const target = message.mentions.members.first() || message.member;
    const embed = new EmbedBuilder()
      .setTitle(`👤 ${target.user.username} User Info`)
      .setThumbnail(target.user.displayAvatarURL())
      .addFields(
        { name: '🏷️ Username', value: target.user.tag, inline: true },
        { name: '🎭 Nickname', value: target.nickname || 'None', inline: true },
        { name: '📅 Joined Server', value: target.joinedAt.toDateString(), inline: true },
        { name: '📅 Account Created', value: target.user.createdAt.toDateString(), inline: true }
      )
      .setColor(0x5865F2);
    message.reply({ embeds: [embed] });
  }

  // ── MODERATION ────────────────────────────────────
  if (command === '/clear') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply('❌ You need **Manage Messages** permission!');
    }
    const amount = parseInt(args[1]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply('❌ Please provide a number between 1-100. e.g. `/clear 10`');
    }
    await message.channel.bulkDelete(amount, true);
    const msg = await message.channel.send(`🧹 Deleted **${amount}** messages!`);
    setTimeout(() => msg.delete(), 3000);
  }

  if (command === '/kick') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply('❌ You need **Kick Members** permission!');
    }
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Please mention someone. e.g. `/kick @user`');
    const reason = args.slice(2).join(' ') || 'No reason provided';
    await target.kick(reason);
    message.reply(`✅ **${target.user.tag}** has been kicked. Reason: ${reason}`);
  }

  if (command === '/ban') {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply('❌ You need **Ban Members** permission!');
    }
    const target = message.mentions.members.first();
    if (!target) return message.reply('❌ Please mention someone. e.g. `/ban @user`');
    const reason = args.slice(2).join(' ') || 'No reason provided';
    await target.ban({ reason });
    message.reply(`✅ **${target.user.tag}** has been banned. Reason: ${reason}`);
  }

  // ── HELP ──────────────────────────────────────────
  if (command === '/help') {
    const embed = new EmbedBuilder()
      .setTitle('👻 Ghost Bot Commands')
      .addFields(
        { name: '🎮 Fun', value: '`/joke` `/8ball` `/coinflip` `/roll`' },
        { name: '📊 Info', value: '`/serverinfo` `/userinfo @user`' },
        { name: '🛡️ Moderation', value: '`/clear [1-100]` `/kick @user` `/ban @user`' },
        { name: '⚠️ Auto-Mod', value: '`/warn @user [reason]` `/warns @user` `/clearwarns @user`' },
        { name: '🏓 Basic', value: '`/hello` `/ping` `/help`' }
      )
      .setColor(0x5865F2)
      .setFooter({ text: 'Ghost Bot 👻' });
    message.reply({ embeds: [embed] });
  }
  await handleAutoMod(message);
  await handleModCommands(message);
});

client.login(process.env.TOKEN);
