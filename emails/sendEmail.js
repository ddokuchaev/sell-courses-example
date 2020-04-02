const keys = require("../keys");
const registerEmail = require("../emails/registration");
const resetEmail = require("../emails/reset");

const UniSender = require("unisender");

const uniSender = new UniSender({
  api_key: keys.UNISENDER_API_KEY,
  lang: "ru" // optional, 'en' by default
});

module.exports.sendRegMail = async function(email) {
  const senderList = await uniSender.getLists();
  if (senderList.result.length) {
    await uniSender
      .sendEmail(registerEmail(email, senderList.result[0].id))
      .then(function(response) {
        return {};
      })
      .catch(function(response) {
        return { message: "Ошибка: " + response.error };
      });
  } else {
    return { message: "Ошибка: отправитель не задан" };
  }
};

module.exports.sendTokenMail = async function(email, token, dateExp) {
  const senderList = await uniSender.getLists();
  if (senderList.result.length) {
    await uniSender
      .sendEmail(resetEmail({ email, token }, senderList.result[0].id))
      .then(function(response) {
        return {};
      })
      .catch(function(response) {
        return { message: "Ошибка: " + response.error };
      });
  } else {
    return { message: "Ошибка: отправитель не задан" };
  }
};
