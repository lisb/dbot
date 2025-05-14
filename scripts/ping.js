// Description:
//   Utility commands surrounding Hubot uptime.
//
// Commands:
//   ping - Reply with pong
//   echo <text> - Reply back with <text>
//   time - Reply with current time
"use strict";

const { OllamaWrapper } = require("./ollama_wrapper");

const g_messages = [];

module.exports = (robot) => {
  robot.hear(/room/i, (res) => {
    // この部分
    res.send(`This room id is ${res.message.room}`);
  });
  robot.respond(/(.*)/, (res) => {
    // console.log(res);
    const message = { role: "user", content: res.match[1] };
    g_messages.push(message);
    OllamaWrapper.getResponse(g_messages)
      .then((response) => {
        res.send(response);
        g_messages.push({ role: "assistant", content: response });
      })
      .catch((error) => {
        console.error("Error:", error);
        res.send("An error occurred while processing your request.");
      });
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
