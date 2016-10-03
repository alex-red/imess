const sqlite3 = require('sqlite3');
const express = require('express');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const app = express();
const router = express.Router();
require('shelljs/global');

import { CONFIG } from './config';
const dbPath = process.env.HOME + "/Library/Messages/chat.db";
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, init);
let local = {};

function log(msg) {
  console.log(msg);
};

function init(evt) {
  const success = evt === null;
  if (success) {
    log('Succesfully opened chat DB.');
    // db.all('select * from chat order by ROWID desc', (err, rows) => {
    //   local.chats = rows;
    // });
  } else {
    log(`Failed to open chat DB. \nError: ${evt}`);
  }
};

function sendMessage(person, message) {
  let script = `osascript -e 'tell application "Messages"
  send "${message}" to buddy "${person}" of (service 1 whose service type is iMessage)
  end tell'`
  return exec(script).code
}

// ROUTES

router.use((req, res, next) => {
  next();
})

// 

router.get('/', (req, res) => {
  res.json({Working: true});
});

// All chats
router.route('/chats')
  .get((req, res) => {
    db.all('select * from chat order by ROWID desc', (err, rows) => {
        res.json(rows);
    });
  });

// Messages
router.route('/messages')
  .get((req, res) => {
    db.all('select * from message', req.params.chat_id, (err, rows) => {
      res.json(rows);
    });
  });

router.route('/messages/:chat_id')
  .get((req, res) => {
    const query = "select datetime(date + strftime('%s', '2001-01-01 00:00:00'), 'unixepoch', 'localtime') as date_sent, " +
    "datetime(date_delivered + strftime('%s', '2001-01-01 00:00:00'), 'unixepoch', 'localtime') as date_read, " +
    "* from message where handle_id=?"
    db.all(query, req.params.chat_id, (err, rows) => {
      res.json(rows);
    });
  });

router.route('/message/:person/:message')
  .post((req, res) => {
    let person = req.params.person;
    let message = req.params.message;
    res.json(sendMessage(person, message));
  });

// Attachments
router.route('/attachments')
  .get((req, res) => {
    const query = "select message_id, service, account, replace(filename, '~/Library/Messages/Attachments', '') "+
    " as filename, mime_type, transfer_state, transfer_name, total_bytes, " +
    "is_sticker, datetime(created_date + strftime('%s', '2001-01-01 00:00:00'), 'unixepoch', 'localtime') as date from " +
    "message_attachment_join J inner join message M on J.message_id=M.ROWID inner join attachment A on " + 
    "J.attachment_id=A.ROWID"
    db.all(query, (err, rows) => {
        res.json(rows);
    });
  });

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));
app.use(helmet());
app.use(express.static(process.env.HOME + "/Library/Messages/Attachments/"));
app.use('/api', router);

const server = app.listen(CONFIG.port, () => {
  console.log(`Amazing things on port: ${CONFIG.port}`);
});

const beforeShutdown = () => {
  console.log('\nRecieved kill signal or interuption... shutting down.');
  db.close();
  server.close();
  process.exit();
}

process.on ('SIGTERM', beforeShutdown);
process.on ('SIGINT', beforeShutdown);
process.on ('uncaughtException', beforeShutdown);