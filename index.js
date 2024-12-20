const mineflayer = require("mineflayer");
const config = require("./config.json");
let number = 100; // Nomor awal untuk username bot
let activeBots = []; // Array untuk melacak bot yang sedang aktif

function createBot(botNumber) {
  if (activeBots.length >= config.maxActiveBots) {
    // Jika sudah mencapai batas maksimum bot, keluarkan bot paling lama
    const oldestBot = activeBots.shift(); // Hapus bot pertama dari daftar
    if (oldestBot) {
      oldestBot.quit("Rejoining to make room.");
      console.log(`Bot ${oldestBot.username} kicked to make room.`);
    }
  }

  // Buat bot baru
  const bot = mineflayer.createBot({
    host: config.ip,
    port: config.port,
    username: `${config.crackedusernameprefix}${botNumber}`,
    version: config.version,
  });

  activeBots.push(bot); // Tambahkan bot baru ke daftar bot aktif

  // Event ketika bot login
  bot.on("login", () => {
    console.log(`Bot ${bot.username} logged in.`);
    // Kirim perintah register atau login
    setTimeout(() => {
      bot.chat(`/register ${config.password} ${config.password}`);
      bot.chat(`/login ${config.password}`);
    }, 1000);

    // Spam chat jika diaktifkan
    if (config.enableSpam) {
      setInterval(() => {
        bot.chat(config.spamMessage);
      }, config.spamIntervalMs);
    }

    // Bot akan keluar dan login ulang setelah rejoinintervalms
    setTimeout(() => {
      bot.quit("Rejoining...");
      activeBots = activeBots.filter((b) => b !== bot); // Hapus bot dari daftar aktif
      createBot(botNumber + config.maxActiveBots); // Ganti bot dengan nomor baru
    }, config.rejoinintervalms);
  });

  // Event ketika bot ditendang
  bot.on("kicked", (reason) => {
    console.log(`Bot ${bot.username} was kicked: ${reason}`);
    activeBots = activeBots.filter((b) => b !== bot); // Hapus bot dari daftar aktif
  });

  // Event ketika bot mengalami error
  bot.on("error", (err) => {
    console.log(`Bot ${bot.username} encountered an error: ${err.message}`);
    activeBots = activeBots.filter((b) => b !== bot); // Hapus bot dari daftar aktif
  });

  // Event ketika bot keluar
  bot.on("end", () => {
    activeBots = activeBots.filter((b) => b !== bot); // Hapus bot dari daftar aktif
  });
}

// Mulai membuat bot secara bertahap
for (let i = 0; i < config.maxActiveBots; i++) {
  createBot(number + i); // Membuat 5 bot pertama
}
