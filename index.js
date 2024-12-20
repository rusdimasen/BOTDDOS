const mineflayer = require("mineflayer");
const config = require("./config.json");
let number = 100;
let activeBots = [];

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

  bot.on("login", () => {
    console.log(`Bot ${bot.username} logged in.`);
    setTimeout(() => {
      bot.chat(`/register ${config.password} ${config.password}`);
      bot.chat(`/login ${config.password}`);
    }, getRandomDelay(500, 1500));

    // Simulasi Gerakan Random
    setInterval(() => {
      const x = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;
      bot.setControlState("forward", true);
      bot.lookAt(bot.entity.position.offset(x, 0, z), true);
      setTimeout(() => {
        bot.setControlState("forward", false);
      }, getRandomDelay(500, 1500));
    }, getRandomDelay(5000, 10000));
  });

  // Mendeteksi Kicked
  bot.on("kicked", (reason, loggedIn) => {
    console.log(`Bot ${bot.username} was kicked: ${reason}`);
    activeBots = activeBots.filter((b) => b !== bot);
  });

  // Proteksi Deteksi Plugin
  bot.on("packet", (data, metadata) => {
    if (metadata.name === "tab_complete") {
      console.log("Detected suspicious packet: tab_complete.");
      return; // Blokir tab complete
    }
  });

  bot.on("end", () => {
    activeBots = activeBots.filter((b) => b !== bot);
  });
}

// Buat Bot dengan IP Random
for (let i = 0; i < config.maxActiveBots; i++) {
  setTimeout(() => {
    createBot(number + i);
  }, getRandomDelay(1000, 5000));
}
