const express = require("express"); //веб-сервер
const path = require("path"); //работа с путями
const csrf = require("csurf"); //защита форм отправки данных на сервер
const flash = require("connect-flash"); //передача сообщений с сервера на клиент
const mongoose = require("mongoose"); //драйвер СУБД Mongoose
const exphbs = require("express-handlebars"); //шаблон для HTML
const session = require("express-session"); //сессии для веб-сервера Express
const MongoStore = require("connect-mongodb-session")(session); //запись сессий в СУБД Mongoose
const helmet = require("helmet"); //защита Express - добавление различных хеддеров
const compression = require("compression"); //сжатие данных
const homeRoutes = require("./routes/home");
const addRoutes = require("./routes/add");
const cartRoutes = require("./routes/cart");
const coursesRoutes = require("./routes/courses");
const orderRoutes = require("./routes/orders");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const varMiddleware = require("./middleware/variables");
const userMiddleware = require("./middleware/user");
const fileMiddleware = require("./middleware/file");
const errorHandler = require("./middleware/error");
const keys = require("./keys");

const app = express();
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
  helpers: require("./utils/hbs-helpers")
});

const store = new MongoStore({
  collection: "sessions",
  uri: keys.MONGODB_URI
});

//Настройка handlebars
app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

//Настройка статической папки
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.urlencoded({ extended: true }));
//Настройка сессий
app.use(
  session({
    secret: keys.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store
  })
);
//Загрузка файлов
app.use(fileMiddleware.single("avatar"));
app.use(csrf());
app.use(flash());
app.use(helmet());
app.use(compression());
app.use(varMiddleware);
app.use(userMiddleware);

//Routes
app.use("/", homeRoutes);
app.use("/add", addRoutes);
app.use("/courses", coursesRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

app.use(errorHandler); //404

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await mongoose.connect(keys.MONGODB_URI, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useUnifiedTopology: true
    });

    app.listen(PORT, () => {
      console.log("Server is runing on port : ", PORT);
    });
  } catch (error) {
    console.log(error);
  }
}

start();
