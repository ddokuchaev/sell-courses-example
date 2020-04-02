const { Router } = require("express");
const auth = require("../middleware/auth");
const User = require("../model/user");
const path = require("path");
const router = Router();

router.get("/", auth, async (req, res) => {
  console.log(req.user.toObject());
  res.render("profile", {
    title: "Профиль",
    isProfile: true,
    user: req.user.toObject()
  });
});

router.post("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const toChange = {
      name: req.body.name
    };

    if (req.file) {
      toChange.avatarURL = path.normalize(req.file.path);
    }

    Object.assign(user, toChange);
    user.save();
    res.redirect("/profile");
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
