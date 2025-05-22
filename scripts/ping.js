// Description:
//   Utility commands surrounding Hubot uptime.
//
// Commands:
//   ping - Reply with pong
//   echo <text> - Reply back with <text>
//   time - Reply with current time
"use strict";

const { generateBotResponse, generateCommand } = require("./bot");

const g_messages = [];

const onfile = (res, file) => {
  res.send("ファイルの検証が終わるまで少々お待ちください...");
  const dl = () => {
    res.download(file, async (path, err) => {
      if (err) {
        console.log("failed2:" + err.message);
        setTimeout(dl, 30000);
      }
      console.log("succeed2:" + path);
      const message = {
        role: "user",
        content: res.json.text ? res.json.text.replace("Hubot ", "") : "",
        images: [path],
      };
      g_messages.push(message);
      const command = "c_message";
      const response = await generateBotResponse(command, [message]);
      if (!response) {
        return;
      }
      g_messages.push({
        role: "assistant",
        content: response,
      });

      res.send(response);
    });
  };
  setTimeout(dl, 30000);
};

module.exports = (robot) => {
  robot.hear(/room/i, (res) => {
    // この部分
    res.send(`This room id is ${res.message.room}`);
  });

  // ファイルが1つだけの場合
  robot.hear("file", (res) => {
    onfile(res, res.json);
  });

  // ファイルが複数の場合
  robot.hear("files", (res) => {
    for (const file of res.json.files) {
      onfile(res, file);
      if (res.json.text) {
        console.log(`with text: ${res.json.text}`);
      }
    }
  });

  const isFileJSON = (text) => {
    try {
      const json = JSON.parse(text);
      if (json.files || json.file_id) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  robot.respond(/(.*)/, async (res) => {
    console.log("respond", res.message.text);

    if (isFileJSON(res.message.text.replace("Hubot ", ""))) {
      console.log("message is file json");
      return;
    }
    const message = {
      role: "user",
      content: res.message.text.replace("Hubot ", ""),
    };
    g_messages.push(message);
    const commandResponse = await generateCommand([message]);
    const commandList = commandResponse.command;
    for (let i = 0; i < commandList.length; i++) {
      const command = commandList[i];
      generateBotResponse(command, [message]).then((response) => {
        if (!response) {
          return;
        }
        g_messages.push({
          role: "assistant",
          content: response,
        });

        res.send(response);
      });
    }
  });
  robot.respond(/PING$/i, (res) => {
    res.send("PONG");
  });

  robot.respond(/ADAPTER$/i, (res) => {
    res.send(robot.adapterName);
  });

  robot.respond(/ECHO (.*)$/i, (res) => {
    res.send(res.match[1]);
  });

  robot.respond(/TIME$/i, (res) => {
    res.send(`Server time is: ${new Date()}`);
  });
};
