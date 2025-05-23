const { generateBotResponse } = require("../command_handlers");
const { generateCommand } = require("../command_master");

const messageHandler = async (res, memoryState) => {
  const message = {
    role: "user",
    content: res.message.text.replace("Hubot ", ""),
  };
  const commandResponse = await generateCommand([message]);
  const commandList = commandResponse.command;
  for (let i = 0; i < commandList.length; i++) {
    const command = commandList[i];
    const response = await generateBotResponse(res, command, [
      ...memoryState,
      message,
    ]);
    if (!response) {
      return;
    }
    memoryState.push(message);
    memoryState.push({
      role: "assistant",
      content: response,
    });

    res.send(response);
  }
};

module.exports = {
  messageHandler,
};
