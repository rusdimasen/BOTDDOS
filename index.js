const snekfetch = require("snekfetch");
const config = require("./config.json");
let number = 100; // Awal nomor username cracked

function createBot(initialNumber) {
  let currentNumber = initialNumber;

  function loginBot() {
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
      // Kirim perintah register atau login
      bot.chat(`/register ${config.password} ${config.password}`);
      bot.chat(`/login ${config.password}`);
      setTimeout(() => {
        bot.quit("Rejoining...");
        currentNumber++; // Ganti username
        loginBot(); // Login ulang
      }, config.rejoinintervalms);
    });

    bot.on('error', (err) => console.log(err));
    bot.on('kicked', (reason) => {
      console.log("Kicked for", reason);
    });
  }

  loginBot();
}

// Membuat beberapa bot
for (let i = 0; i < 10; i++) { // 10 bot, ubah jumlah sesuai kebutuhan
  createBot(number + i);
}
