const { body } = require("express-validator");
const User = require("../model/user");
const bcrypt = require("bcryptjs");

exports.reregisterValidators = [
  body("email")
    .isEmail()
    .withMessage("Введите корректный e-mail")
    .custom(async (value, req) => {
      try {
        const candidate = await User.findOne({ email: value });
        if (candidate) {
          return Promise.reject("Такой e-mail уже занят");
        }
      } catch (e) {
        console.log(e);
      }
    })
    .normalizeEmail(),
  body("password", "Пароль должен быть минимум 6 символов")
    .isLength({ min: 6, max: 56 })
    .isAlphanumeric()
    .trim(),
  body("confirm")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Пароли должны совпадать");
      }
      return true;
    })
    .trim(),
  body("name")
    .isLength({ min: 3 })
    .withMessage("Имя должно быть минимум 3 символа")
    .trim()
];

exports.loginValidators = [
  body("email", "Введен некорректный email").isEmail(),
  body("email").custom(async (value, { req }) => {
    try {
      const candidate = await User.findOne({ email: value });
      if (!candidate) {
        return Promise.reject("Пользователь с таким email не зарегистрирован");
      } else {
        const areSame = await bcrypt.compare(
          req.body.password,
          candidate.password
        );
        if (!areSame) {
          return Promise.reject("Пароль указан неверно");
        }
      }
    } catch (e) {
      console.log(e);
    }
  }),
  body("password", "Вы не указали пароль").isLength({ min: 3 })
];

exports.courseValidators = [
  body("title")
    .isLength({ min: 3 })
    .withMessage("Минимальная длина названия 3 символа")
    .trim(),
  body("price")
    .isNumeric()
    .withMessage("Введите корректную цену"),
  body("img", "Введите корректный URL картинки").isURL()
];
