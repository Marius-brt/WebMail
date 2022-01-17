require("dotenv").config();
const oneside = require("oneside");
const app = oneside.init({
  showCompiling: true,
  favicon: "favicon.ico",
  paths: {
    sources: "./public",
    views: "./views",
    components: "./components",
  },
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/email", require("./routes/email"));

app.get("/", (req, res) => {
  oneside.render("home", res).send();
});

app.get("/login", (req, res) => {
  oneside
    .render("login", res)
    .ejs({
      name: process.env.APP_NAME,
      host: process.env.MAIL_HOST,
    })
    .send();
});

app.get("/signup", (req, res) => {
  oneside
    .render("signup", res)
    .ejs({
      name: process.env.APP_NAME,
      host: process.env.MAIL_HOST,
    })
    .send();
});

app.listen();
