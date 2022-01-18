const oneside = require("oneside");
const router = oneside.router();

const { Client } = require("yapople");
const axios = require("axios");
const nodemailer = require("nodemailer");

const aes = require("../../src/aes");
const resp = require("../../src/resp");
const conn = require("../../src/conn");
const auth = require("../../src/auth");
const email = require("../../schemas/email");

let spam_list = [];

axios({
  method: "get",
  url: "https://gist.githubusercontent.com/adamloving/4401361/raw/e81212c3caecb54b87ced6392e0a0de2b6466287/temporary-email-address-domains",
}).then((data) => {
  spam_list = data.data.split("\n");
});

router.get("/refresh_list", auth, async (req, res) => {
  if (req.user.host == process.env.MAIL_HOST) {
    try {
      const client = new Client({
        host: process.env.POP3_HOST,
        port: 995,
        tls: true,
        mailparser: true,
        username: `${req.user.username}@${req.user.host}`,
        password: aes.decrypt(
          req.user.email_pwd,
          aes.key(process.env.ENCRYPT_PWD, req.user.creation_date),
          req.user.iv
        ),
      });
      await client.connect();
      const messages = await client.retrieveAll();
      messages.forEach(async (message) => {
        await conn
          .insert({
            id: message.messageId,
            subject: message.subject,
            from_email: message.from[0].address,
            from_name: message.from[0].name,
            to_email: message.to[0].address,
            date: message.date,
            html: message.html,
            category: spam_list.includes(message.from[0].address.split("@")[1])
              ? "spam"
              : "normal",
          })
          .from("emails_received");
      });
      await client.deleteAll();
      await client.quit();
      res.json(resp(true));
    } catch (ex) {
      res.status(500).json(resp(false, "Cannot retreive emails currently"));
    }
  } else {
    res
      .status(500)
      .json(resp(false, process.env.MAIL_HOST + " not authorized currently"));
  }
});

router.post("/", auth, async (req, res) => {
  const { error, value } = email.new_email(req.body);
  if (error) return res.status(400).json(resp(false, error.details[0].message));
  if (value.email.split("@")[1] != process.env.MAIL_HOST) {
    nodemailer
      .createTransport({
        host: process.env.SMTP_HOST,
        secure: true,
        port: 465,
        auth: {
          user: `${req.user.username}@${req.user.host}`,
          pass: aes.decrypt(
            req.user.email_pwd,
            aes.key(process.env.ENCRYPT_PWD, req.user.creation_date),
            req.user.iv
          ),
        },
      })
      .sendMail({
        from: `${req.user.username}@${req.user.host}`,
        to: value.email,
        subject: value.subject,
        text: value.message,
      });
  } else {
    const user = await conn
      .select("id")
      .where({
        username: value.email.split("@")[0],
        host: value.email.split("@")[1],
      })
      .from("users");
    if (user.length == 0)
      return res.status(404).json(resp(false, "User not found"));
  }
  const id = Date.now().toString();
  await conn
    .insert({
      id,
      subject: value.subject,
      from_email: `${req.user.username}@${req.user.host}`,
      from_name: req.user.username,
      to_email: value.email,
      date: new Date().toISOString().slice(0, 19).replace("T", " "),
      html: value.message,
      category: "normal",
      new: 1,
      type:
        value.email.split("@")[1] != process.env.MAIL_HOST
          ? "email"
          : "message",
    })
    .from("emails_received");
  await conn
    .insert({
      id,
      sender_username: req.user.username,
    })
    .from("emails_sended");
  res.json(resp(true));
});

router.get("/sended", auth, (req, res) => {
  conn
    .raw(
      "SELECT * FROM emails_received WHERE id IN (SELECT id FROM emails_sended WHERE sender_username=?)",
      [req.user.username]
    )
    .then((data) => {
      res.json(resp(true, data[0]));
    });
});

router.get("/received", auth, (req, res) => {
  conn("emails_received")
    .select()
    .where({
      to_email: `${req.user.username}@${req.user.host}`,
    })
    .then((data) => {
      res.json(resp(true, data));
    });
});

module.exports = router;
