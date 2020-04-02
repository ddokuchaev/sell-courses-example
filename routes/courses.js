const { Router } = require("express");
const Course = require("../model/courses");
const auth = require("../middleware/auth");
const router = Router();
const { courseValidators } = require("../utils/validators");
const { validationResult } = require("express-validator");

function isOwner(course, req) {
  return course.userId.toString() === req.user._id.toString();
}

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    const _courses = JSON.parse(JSON.stringify(courses));
    res.render("courses", {
      title: "Курсы",
      isCourses: true,
      _userId: req.user ? req.user._id.toString() : null,
      courses: _courses
    });
  } catch (e) {
    console.log(e);
  }
});

router.post("/edit", auth, courseValidators, async (req, res) => {
  const errors = validationResult(req);
  const { id } = req.body;

  if (!errors.isEmpty()) {
    return res.status(422).redirect(`/courses/${id}/edit?allow=true`);
  }

  try {
    delete req.body.id;
    const course = await Course.findById(id);
    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }
    Object.assign(course, req.body);
    await course.save();
    res.redirect("/courses");
  } catch (e) {
    console.log(e);
  }
});

router.post("/remove", auth, async (req, res) => {
  try {
    const { id } = req.body;
    await Course.deleteOne({
      _id: id,
      userId: req.user._id
    });
    res.redirect("/courses");
  } catch (e) {
    console.log(e);
  }
});

router.get("/:id/edit", auth, async (req, res) => {
  if (!req.query.allow) {
    res.redirect("/");
    return;
  }

  try {
    const course = await Course.findById(req.params.id);
    const _course = JSON.parse(JSON.stringify(course));

    if (!isOwner(course, req)) {
      return res.redirect("/courses");
    }

    res.render("course-edit", {
      title: `Редактировать ${course.title}`,
      course: _course
    });
  } catch (e) {
    console.log(e);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    const _course = JSON.parse(JSON.stringify(course));
    res.render("course", {
      title: course.title,
      course: _course
    });
  } catch (e) {
    console.log(e);
  }
});

module.exports = router;
