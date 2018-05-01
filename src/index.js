const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
// replace the value below with the Telegram token you receive from @BotFather
const token = '453855287:AAFWGwmSQKOEVcoh2rFuV50_VZR1f-GXPy8';

// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, {polling: true});

const exchangeRateURL = 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
var exchangeRates = {
    UAH: 1.0,
    USD: 27.0,
    EUR: 30.0,
    GBP: 36.0
};


function updateExchangeRates() {
    var request = require('request');
    request.get(exchangeRateURL, {}, function (err, res, data) {
        if (err) {
            return console.log(err);
        }
        if (res.statusCode != 209) {
            var JSONDATA = data;
            exchangeRates = [];
            exchangeRates['UAH'] = 1;
            var jsonList = JSON.parse(JSONDATA);
            jsonList.forEach(function (entry) {
                exchangeRates[entry.cc] = entry.rate;
            });
            // console.log(exchangeRates);

        }
    });

}

//updates exchange rates every day at 9 am
schedule.scheduleJob('0 9 * * * ', function () {
    updateExchangeRates();
});


bot.onText(/\/update/, function (msg, match) {
    updateExchangeRates();
});

bot.onText(/\/convert (.+)/, function (msg, match) {
    var tokens = msg.text.split(" ");
    if (tokens.length != 5) {
        return;
    }
    var initSum = tokens[1];
    var initCurrency = tokens[2].toUpperCase();
    var toCurrency = tokens[4].toUpperCase();
    var initCurrencyToUahRate = exchangeRates[initCurrency];
    var uahToToCurrencyRate = exchangeRates[toCurrency];
    var finalSum = initSum * initCurrencyToUahRate / uahToToCurrencyRate;
    bot.sendMessage(msg.chat.id, "Сума після конвертації: " + finalSum.toFixed(2) + toCurrency);

});

bot.onText(/\/start/, function (msg, match) {
    updateExchangeRates();
});


bot.onText(/\/rates/, function (msg, match) {
    var exchangeRatesForToday = "Курс валют (до гривні) на сьогодні\n" + "🇺🇸 1.00 USD -- " + exchangeRates['USD'].toFixed(3) + " гривень\n" + "🇪🇺 1.00 EUR -- " + exchangeRates['EUR'].toFixed(3) + " гривень\n" + "🇬🇧 1.00 GBP -- " + exchangeRates['GBP'].toFixed(3) + " гривень\n" + "🇷🇺 1.00 RUB -- " + exchangeRates['RUB'].toFixed(3) + " гривень\n";
    bot.sendMessage(msg.chat.id, exchangeRatesForToday);
});




