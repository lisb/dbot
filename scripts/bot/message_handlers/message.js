const { generateBotResponse } = require("../command_handlers");
const { generateCommand } = require("../command_master");
const { store } = require("../../store");

const messageHandler = async (res, memory) => {
  const message = {
    role: "user",
    content: res.message.text.replace("Hubot ", ""),
  };
  memory.push(message);
  const commandResponse = await generateCommand([message]);
  const commandList = commandResponse.command;
  for (let i = 0; i < commandList.length; i++) {
    const command = commandList[i];
    const response = await generateBotResponse(command, memory);
    if (!response) {
      return;
    }
    memory.push({
      role: "assistant",
      content: response,
    });

    res.send(response);
  }
};

module.exports = {
  messageHandler,
};
