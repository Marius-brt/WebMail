const oneside = require("oneside");
const app = oneside.init({
  showCompiling: true,
  favicon: "favicon.ico",
});

app.get("/", (req, res) => {
  oneside
    .render("home", res)
    .ejs({
      version: require("./package.json").dependencies.oneside.replace("^", ""),
    })
    .send();
});

app.listen();
