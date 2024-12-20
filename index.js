const snekfetch = require("snekfetch");
const config = require("./config.json");
let number = 100; // Awal nomor username cracked
let activeBots = []; // Array untuk melacak bot yang sedang aktif

function createBot(initialNumber) {
  let currentNumber = initialNumber;

  function loginBot() {
    if (activeBots.length >= config.maxActiveBots) {
      // Jika sudah mencapai batas bot, kick bot paling lama
      const oldestBot = activeBots.shift(); // Hapus bot pertama dari array
      if (oldestBot) {
        oldestBot.quit("Rejoining to make room.");
        console.log(`Bot ${oldestBot.username} kicked to make room.`);
      }
    }

    if (config.altening) {
      snekfetch.get(`http://api.thealtening.com/v1/generate?token=${config.altening_token}&info=true`).then((n) => {
        var mineflayer = require('mineflayer');
        var bot = mineflayer.createBot({
          host: config.ip,
          port: config.port,
          username: n.body.token,
          version: config.version
        });

        handleBotEvents(bot);
      });
    } else {
      var mineflayer = require('mineflayer');
      var bot = mineflayer.createBot({
        host: config.ip,
        port: config.port,
        username: `${config.crackedusernameprefix}${currentNumber}`,
        version: config.version
      });

      handleBotEvents(bot);
    }
  }

  function handleBotEvents(bot) {
    bot.on('login', () => {
      console.log(`Logged in as: ${bot.username}`);
      activeBots.push(bot); // Tambahkan bot ke daftar aktif

      // Rejoin setelah waktu tertentu
      setTimeout(() => {
        bot.quit("Rejoining...");
        activeBots = activeBots.filter((b) => b !== bot); // Hapus dari daftar aktif
        currentNumber++; // Ganti username
        loginBot(); // Login ulang
      }, config.rejoinintervalms);
    });

    bot.on('error', (err) => console.log(err));
    bot.on('kicked', (reason) => {
      console.log("Kicked for", reason);
      activeBots = activeBots.filter((b) => b !== bot); // Hapus dari daftar aktif
    });
  }

  loginBot();
}

// Membuat bot secara terus-menerus dengan interval tertentu
setInterval(() => {
  createBot(number++);
}, config.loginintervalms);
