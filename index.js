const mineflayer = require("mineflayer");
const config = require("./config.json");
let number = 100; // Nomor awal untuk username bot
let activeBots = []; // Array untuk melacak bot yang sedang aktif
let ipIndex = 0; // Indeks untuk IP yang sedang digunakan

function getNextIP() {
  // Dapatkan IP berikutnya dari daftar
  const ip = config.ipList[ipIndex];
  ipIndex = (ipIndex + 1) % config.ipList.length; // Beralih ke IP berikutnya (circular)
  return ip;
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min; // Delay acak
}

function createBot(botNumber) {
  if (activeBots.length >= config.maxActiveBots) {
    const oldestBot = activeBots.shift();
    if (oldestBot) {
      oldestBot.quit("Rejoining to make room.");
      console.log(`Bot ${oldestBot.username} kicked to make room.`);
    }
  }

  const ip = getNextIP(); // Pilih IP dari daftar
  console.log(`Using IP: ${ip}`);

  const bot = mineflayer.createBot({
    host: ip,
    port: config.port,
    username: `${config.crackedusernameprefix}${botNumber}`,
    version: config.version,
  });

  activeBots.push(bot);

  bot.on("login", () => {
    console.log(`Bot ${bot.username} logged in at ${ip}.`);

    setTimeout(() => {
      bot.chat(`/register ${config.password} ${config.password}`);
      bot.chat(`/login ${config.password}`);
    }, getRandomDelay(1000, 3000)); // Kirim perintah dengan delay acak

    // Spam chat jika diaktifkan
    if (config.enableSpam) {
      setInterval(() => {
        bot.chat(`${config.spamMessage} ${Math.random().toString(36).substring(7)}`); // Pesan dengan teks acak
      }, getRandomDelay(3000, 6000)); // Interval acak
    }

    // Simulasi gerakan untuk menghindari deteksi bot
    setInterval(() => {
      const x = Math.random() * 2 - 1; // Gerakan acak pada sumbu X
      const z = Math.random() * 2 - 1; // Gerakan acak pada sumbu Z
      bot.setControlState("forward", true);
      bot.lookAt(bot.entity.position.offset(x, 0, z), true);
      setTimeout(() => {
        bot.setControlState("forward", false);
      }, getRandomDelay(500, 1500));
    }, getRandomDelay(5000, 10000));

    // Rejoin setelah waktu tertentu
    setTimeout(() => {
      bot.quit("Rejoining...");
      activeBots = activeBots.filter((b) => b !== bot);
      createBot(botNumber + config.maxActiveBots);
    }, config.rejoinintervalms);
  });

  bot.on("kicked", (reason) => {
    console.log(`Bot ${bot.username} was kicked: ${reason}`);
    activeBots = activeBots.filter((b) => b !== bot);
  });

  bot.on("error", (err) => {
    console.log(`Bot ${bot.username} encountered an error: ${err.message}`);
    activeBots = activeBots.filter((b) => b !== bot);
  });

  bot.on("end", () => {
    activeBots = activeBots.filter((b) => b !== bot);
  });
}

for (let i = 0; i < config.maxActiveBots; i++) {
  createBot(number + i);
}
