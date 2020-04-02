const { Router } = require("express");
const User = require("../model/user");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const {
  reregisterValidators,
  loginValidators
} = require("../utils/validators");
const router = Router();
const emailSender = require("../emails/sendEmail");

router.get("/login", async (req, res) => {
  res.render("auth/login", {
    title: "Авторизация",
    isLogin: true,
    loginError: req.flash("loginError"),
    registerError: req.flash("registerError")
  });
});

router.post("/login", loginValidators, async (req, res) => {
  //До валидации
  /*
  try {
    const { email, password } = req.body;
    const candidate = await User.findOne({ email });
    if (candidate) {
      const areSame = await bcrypt.compare(password, candidate.password);
      if (areSame) {
        req.session.user = candidate;
        req.session.isAuthenticated = true;
        req.session.save((err) => {
          if (err) throw err;
          res.redirect("/");
        });
      } else {
        req.flash("loginError", "Неверный пароль");
        res.redirect("/auth/login#login");
      }
    } else {
      req.flash("loginError", "Пользователя с таким логином - не существует");
      res.redirect("/auth/login#login");
    }
  } catch (e) {
    console.log(e);
  }
  */
  //После валидации
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("loginError", errors.array()[0].msg);
      res.redirect("/auth/login#login");
    } else {
      const candidate = await User.findOne({ email: req.body.email });
      req.session.user = candidate;
      req.session.isAuthenticated = true;
      req.session.save((err) => {
        if (err) throw err;
        res.redirect("/");
      });
    }
  } catch (e) {
    console.log(e);
  }
});

router.get("/logout", async (req, res) => {
  req.session.destroy(() => {
    res.redirect("/auth/login/#login");
  });
});

router.post("/register", reregisterValidators, async (req, res) => {
  try {
    const { email, name, password } = req.body;

    //Валидация
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("registerError", errors.array()[0].msg);
      return res.status(422).redirect("/auth/login#register");
    }

    const hashPasword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      name,
      password: hashPasword,
      cart: { items: [] }
    });
    await user.save();
    res.redirect("/auth/login#login");
    //отправка почтового сообщения
    const err = await emailSender.sendRegMail(email);
    if (err) {
      req.flash("registerError", err.message);
    }
  } catch (error) {
    console.log(error);
  }
});

router.get("/reset", (req, res) => {
  res.render("auth/reset", {
    title: "Забыли пароль?",
    error: req.flash("error")
  });
});

router.post("/reset", (req, res) => {
  try {
    crypto.randomBytes(32, async (err, buffer) => {
      if (err) {
        req.flash("error", "Что-то пошло не так, повторите попытку позже");
        return res.redirect("/auth/reset");
      }
      const token = buffer.toString("hex");
      const candidate = await User.findOne({ email: req.body.email });
      if (candidate) {
        //Отправим письмо с токеном
        candidate.resetToken = token;
        candidate.resetTokenExp = Date.now() + 60 * 60 * 1000; //1 час
        await candidate.save();
        const err = await emailSender.sendTokenMail(candidate.email, token);
        if (err) {
          req.flash("error", err.message);
          res.redirect("/auth/reset");
        }
        res.redirect("/auth/login");
      } else {
        //Ошибка
        req.flash("error", "Пользователь с таким email не зарегистрирован");
        res.redirect("/auth/reset");
      }
    });
  } catch (error) {
    console.log(error);
  }
});

router.get("/password/:token", async (req, res) => {
  console.log("body", req.body);
  if (!req.params.token) {
    return res.redirect("/auth/login");
  }
  try {
    const user = await User.findOne({
      resetToken: req.params.token,
      resetTokenExp: { $gt: Date.now() }
    });
    if (!user) {
      return res.redirect("/auth/login");
    } else {
      res.render("auth/password", {
        title: "Восстановить доступ",
        userId: user._id,
        token: req.params.token
      });
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/password", async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      resetToken: req.body.token,
      resetTokenExp: { $gt: Date.now() }
    });
    if (user) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.resetToken = undefined;
      user.resetTokenExp = undefined;
      user.save();
      res.redirect("/auth/login");
    } else {
      req.flash("loginError", "Веремя действия токена истекло");
      res.redirect("/auth/login");
    }
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
