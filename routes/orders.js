const { Router } = require("express");
const router = Router();
const auth = require("../middleware/auth");
const Order = require("../model/order");

router.get("/", auth, async (req, res) => {
  try {
    const orders = await Order.find({
      "user.userId": req.user._id
    }).populate("user.userId");
    const _orders = JSON.parse(JSON.stringify(orders));

    res.render("orders", {
      isOrder: true,
      title: "Мои заказы",
      orders: _orders.map((o) => {
        return {
          ...o,
          price: o.courses.reduce((sum, c) => {
            return (sum += c.course.price);
          }, 0)
        };
      })
    });
  } catch (error) {
    console.log(error);
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const user = await req.user.populate("cart.items.courseId").execPopulate();
    const courses = user.cart.items.map((i) => ({
      count: i.count,
      course: { ...i.courseId._doc }
    }));
    const order = new Order({
      user: {
        name: req.user.name,
        userId: req.user
      },
      courses: courses
    });
    await order.save();
    await req.user.clearCart();
    res.redirect("/orders");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
