const keys = require("../keys");
module.exports = function(args, senderListId) {
  return {
    email: args.email,
    sender_email: keys.EMAIL_FROM,
    sender_name: keys.EMAIL_FROM_NAME,
    subject: "Восстановление доступа",
    list_id: senderListId,
    body: `
    <h1>Вы забыли пароль?</h1>
    <p>Если нет, то проигнорируйте данное письмо</p>
    <p>Иначе перейдите по ссылке ниже. Ссылка действительна в течение 60 минут</p>
    <hr />
    <p><a href="${keys.BASE_URL}/auth/password/${args.token}">Сбросить пароль</a></p>
    `
  };
};
