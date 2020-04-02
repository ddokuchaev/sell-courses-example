const keys = require("../keys");
module.exports = function(email, senderListId) {
  return {
    email: email,
    sender_email: keys.EMAIL_FROM,
    sender_name: keys.EMAIL_FROM_NAME,
    subject: "Аккаунт создан",
    list_id: senderListId,
    body: `
    <h1>Добро пожаловать в наш магазин</h1>
    <p>Вы успешно создали аккаунт с email - ${email}</p>
    <hr />
    <a href="${keys.BASE_URL}">Магазин курсов</a>
    `
  };
};
