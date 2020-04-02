const { Router } = require("express");
const Course = require("../model/courses");
const router = Router();

router.get("/", async (req, res) => {
  const courses = await Course.getAll();
  res.render("courses", {
    title: "Курсы",
    isCourses: true,
    courses: courses
  });
});

router.post("/edit", async (req, res) => {
  await Course.update(req.body);
  res.redirect("/courses");
});

router.get("/:id/edit", async (req, res) => {
  if (!req.query.allow) {
    res.redirect("/");
    return;
  }

  const course = await Course.getById(req.params.id);

  res.render("course-edit", {
    title: `Редактировать ${course.title}`,
    course: course
  });
});

router.get("/:id", async (req, res) => {
  const course = await Course.getById(req.params.id);
  res.render("course", {
    title: course.title,
    course: course
  });
});

module.exports = router;
