# 🔧 How to Add Auto-Mod to Ghost Bot

## Step 1 — Add the file
Place `automod.js` in the same folder as your main bot file (e.g. `index.js`).

## Step 2 — Import it in your index.js
Add this near the top of your `index.js`:

```js
const { handleAutoMod, handleModCommands } = require('./automod');
```

## Step 3 — Hook into the message event
Inside your `client.on('messageCreate', ...)` handler, add these two lines:

```js
client.on('messageCreate', async (message) => {
  await handleAutoMod(message);      // ✅ ADD THIS
  await handleModCommands(message);  // ✅ ADD THIS

  // ... rest of your existing command handling
});
```

## Step 4 — Create a mod-logs channel
In your Discord server, create a text channel named exactly:
**`mod-logs`**
(or change `LOG_CHANNEL_NAME` in automod.js to match yours)

## Step 5 — Add your bad words
Open `automod.js` and edit line 12:
```js
const BAD_WORDS = ['badword1', 'badword2']; // Replace with your actual list
```

---

## 📋 New Commands Added

| Command | Description | Who can use |
|---|---|---|
| `!warn @user [reason]` | Manually warn a user | Mods only |
| `!warns @user` | Check a user's warning count | Mods only |
| `!clearwarns @user` | Reset a user's warnings | Mods only |

---

## ⚙️ Configuration (in automod.js)

| Setting | Default | Meaning |
|---|---|---|
| `maxMessages` | 5 | Messages before spam trigger |
| `timeWindow` | 5000ms | Time window for spam check |
| `warnLimit` | 3 | Warnings before auto-kick |

---

## ✅ Make sure your bot has these permissions
- Manage Messages (to delete messages)
- Kick Members (to auto-kick)
- Read Message History (for spam bulk-delete)
