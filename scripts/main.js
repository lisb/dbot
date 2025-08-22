// Description:
//   Utility commands surrounding Hubot uptime.
//
// Commands:
//   ping - Reply with pong
//   echo <text> - Reply back with <text>
//   time - Reply with current time
"use strict";

const { fileHandler, messageHandler } = require("./bot");
const { isFileJSON } = require("./bot/utils");
const { store } = require("./store");

module.exports = (robot) => {
  robot.hear(/room/i, (res) => {
    res.send(`This room id is ${res.message.room}`);
  });

  // ファイルが1つだけの場合
  robot.hear("file", (res) => {
    fileHandler(res, res.json, store.g_messages);
  });

  // ファイルが複数の場合
  robot.hear("files", (res) => {
    for (const file of res.json.files) {
      fileHandler(res, file, store.g_messages);
      if (res.json.text) {
        console.log(`with text: ${res.json.text}`);
      }
    }
  });

  robot.respond(/(.*)/, async (res) => {
    console.log("respond", res.message.text);

    if (isFileJSON(res.message.text.replace("Hubot ", ""))) {
      console.log("message is file json");
      return;
    }
    await messageHandler(res, store.g_messages);
  });
  robot.respond(/PING$/i, (res) => {
    res.send("PONG");
  });
};
