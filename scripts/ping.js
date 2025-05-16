// Description:
//   Utility commands surrounding Hubot uptime.
//
// Commands:
//   ping - Reply with pong
//   echo <text> - Reply back with <text>
//   time - Reply with current time
"use strict";

const { generateCommand } = require("./command_master");
const { generateBotResponse } = require("./bot");

const g_messages = [];

module.exports = (robot) => {
  robot.hear(/room/i, (res) => {
    // この部分
    res.send(`This room id is ${res.message.room}`);
  });
  robot.hear(/(.*)/, (res) => {
    const message = {
      role: "user",
      content: res.message.text.replace("Hubot ", ""),
    };
    g_messages.push(message);
  });
  robot.respond(/(.*)/, async (res) => {
    console.log(res.message.text);
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
        if (command === "c_message") {
          g_messages.push({
            role: "assistant",
            content: response,
          });
        }
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
