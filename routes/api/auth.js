const oneside = require("oneside");
const router = oneside.router();

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const gen = require("generate-password");

const aes = require("../../src/aes");
const conn = require("../../src/conn");
const resp = require("../../src/resp");
const user = require("../../schemas/user");
const cpanel = require("../../src/cpanel");

router.post("/login", (req, res) => {
  const { error, value } = user.login(req.body);
  if (error) return res.status(400).json(resp(false, error.details[0].message));
  conn("users")
    .select()
    .where({
      username: value.username,
    })
    .then((user) => {
      if (user.length == 0)
        return res.status(404).json(resp(false, "User not found"));
      bcrypt.compare(value.password, user[0].password, (err, match) => {
        if (err) return res.status(500).json(resp(false, "Server error"));
        if (!match) return res.status(404).json(resp(false, "User not found"));
        res.json(
          resp(true, {
            token: jwt.sign({ id: user[0].id }, process.env.JWT, {
              expiresIn: "14d",
            }),
          })
        );
      });
    });
});

router.post("/signup", (req, res) => {
  const { error, value } = user.new_user(req.body);
  if (error) return res.status(400).json(resp(false, error.details[0].message));
  conn
    .select("id")
    .from("users")
    .where({ username: value.username })
    .then((data) => {
      if (data.length > 0)
        return res.status(409).json(resp(false, "Username already exist"));
      bcrypt.genSalt(10, (err, salt) => {
        if (err) return res.status(500).json(resp(false, "Server error"));
        bcrypt.hash(value.password, salt, (err, hash) => {
          if (err) return res.status(500).json(resp(false, "Server error"));
          const now = Date.now().toString();
          const email_pwd = gen.generate({
            length: 20,
            numbers: true,
          });
          const iv = aes.iv;
          cpanel
            .emailAddpop({
              domain: process.env.MAIL_HOST,
              email: `${value.username}@${process.env.MAIL_HOST}`,
              password: email_pwd,
              quota: parseInt(process.env.BASIC_QUOTA),
            })
            .then((obj) => {
              const error = JSON.parse(obj.response).cpanelresult.error;
              if (error) return res.status(409).json(resp(false, error));
              conn
                .insert({
                  username: value.username,
                  password: hash,
                  creation_date: now,
                  host: process.env.MAIL_HOST,
                  email_pwd: aes.encrypt(
                    email_pwd,
                    aes.key(process.env.ENCRYPT_PWD, now),
                    iv
                  ),
                  iv: iv,
                })
                .from("users")
                .then((data) => {
                  res.json(
                    resp(true, {
                      token: jwt.sign(
                        { id: data[0].toString() },
                        process.env.JWT,
                        {
                          expiresIn: "14d",
                        }
                      ),
                    })
                  );
                });
            });
        });
      });
    });
});

module.exports = router;
