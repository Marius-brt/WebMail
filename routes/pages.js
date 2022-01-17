const oneside = require("oneside");
const router = oneside.router();

router.get("/", (req, res) => {
  oneside.render("home", res).send();
});

router.get("/login", (req, res) => {
  oneside
    .render("login", res)
    .ejs({
      name: process.env.APP_NAME,
      host: process.env.MAIL_HOST,
    })
    .send();
});

router.get("/signup", (req, res) => {
  oneside
    .render("signup", res)
    .ejs({
      name: process.env.APP_NAME,
      host: process.env.MAIL_HOST,
    })
    .send();
});

module.exports = router;
