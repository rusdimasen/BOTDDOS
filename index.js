const mineflayer = require("mineflayer");
const config = require("./config.js");
let number = 100; // Nomor awal untuk username bot
let activeBots = [];
let rejoinAttempts = {}; // Catat percobaan rejoin

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function createBot(botNumber) {
  if (activeBots.length >= config.maxActiveBots) {
    const oldestBot = activeBots.shift();
    if (oldestBot) {
      oldestBot.quit("Rejoining to make room.");
      console.log(`Bot ${oldestBot.username} kicked to make room.`);
    }
  }

  const bot = mineflayer.createBot({
    host: config.ip,
    port: config.port,
    username: `${config.crackedusernameprefix}${botNumber}`,
    version: config.version,
  });

  activeBots.push(bot);
  rejoinAttempts[botNumber] = 0; // Reset percobaan rejoin

  bot.once("spawn", () => {
    console.log(`Bot ${bot.username} spawned.`);
    setTimeout(() => {
      bot.chat(`/register ${config.password} ${config.password}`);
      bot.chat(`/login ${config.password}`);
    }, config.loginintervalms);

    if (config.enableSpam) {
      setInterval(() => {
        bot.chat(config.spamMessage);
        console.log(`Bot ${bot.username} spamming: ${config.spamMessage}`);
      }, config.spamIntervalMs);
    }

    setInterval(() => {
      const x = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;
      bot.setControlState("forward", true);
      bot.lookAt(bot.entity.position.offset(x, 0, z), true);
      setTimeout(() => bot.setControlState("forward", false), getRandomDelay(500, 1500));
    }, getRandomDelay(5000, 10000));
  });

  bot.on("kicked", (reason) => {
    console.log(`Bot ${bot.username} was kicked: ${reason}.`);
    rejoin(botNumber);
  });

  bot.on("end", () => {
    console.log(`Bot ${bot.username} disconnected.`);
    rejoin(botNumber);
  });

  bot.on("error", (err) => {
    console.error(`Bot ${bot.username} error: ${err}`);
    rejoin(botNumber);
  });

  function rejoin(botNumber) {
    activeBots = activeBots.filter((b) => b !== bot);
    if (rejoinAttempts[botNumber] < 5) { // Maksimal 5 kali percobaan
      rejoinAttempts[botNumber]++;
      setTimeout(() => createBot(botNumber), config.rejoinintervalms);
    } else {
      console.error(`Bot ${botNumber} gagal rejoin setelah 5 kali percobaan.`);
    }
  }
}

// Buat Bot dengan Delay Konfigurasi
for (let i = 0; i < config.maxActiveBots; i++) {
  setTimeout(() => createBot(number + i), i * config.rejoinintervalms);
}
