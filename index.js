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

app.use("/", require("./routes/pages"));

app.listen();
