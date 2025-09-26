const TelegramBot = require('node-telegram-bot-api');

const TOKEN = "8410243529:AAFYWsVMxpgv_ov-Riy9Pjrb5vrf9Z61w04";
const OWNER_ID = "72495497";

const bot = new TelegramBot(TOKEN, { polling: true });
const userMap = new Map(); // messageId -> userId

console.log("✅ Bot Telegram Forward-Reply siap!");

// ===== START COMMAND =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const isOwner = chatId.toString() === OWNER_ID;

  if (isOwner) {
    bot.sendMessage(chatId, `
🛠 *Halo Owner!*\n\nPesan dari pengguna akan diforward ke sini.\nUntuk membalas:\n> Reply pesan yang diforward, lalu ketik pesan balasan.
    `, { parse_mode: 'Markdown' });
  } else {
    bot.sendMessage(chatId, `
👋 *Halo!*\n\nSilakan kirim pesan apa saja, akan langsung terkirim ke owner.\nAnda bisa kirim teks, foto, video, dll.\n\nOwner akan membalas dengan reply pesan Anda.
    `, { parse_mode: 'Markdown' });
  }
});

// ===== FORWARD USER → OWNER =====
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (chatId.toString() === OWNER_ID) return; // skip owner
  if (msg.text && msg.text.startsWith('/start')) return; // skip /start

  bot.forwardMessage(OWNER_ID, chatId, msg.message_id)
    .then((fwd) => {
      userMap.set(fwd.message_id, chatId);
      console.log(`✉️ Forward dari ${chatId} → owner (msg ${fwd.message_id})`);
    })
    .catch((err) => console.error("❌ Gagal forward:", err));
});

// ===== OWNER REPLY → USER =====
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  if (chatId.toString() !== OWNER_ID) return;
  if (!msg.reply_to_message) return;

  const origMsgId = msg.reply_to_message.message_id;
  const userId = userMap.get(origMsgId);
  if (!userId) {
    bot.sendMessage(OWNER_ID, "⚠️ Pesan ini tidak memiliki mapping pengguna.");
    return;
  }

  const text = msg.text || "[Media tidak didukung]";
  bot.sendMessage(userId, text)
    .then(() => console.log(`✅ Owner → ${userId}: ${text}`))
    .catch((err) => console.error("❌ Gagal kirim ke user:", err));
});
