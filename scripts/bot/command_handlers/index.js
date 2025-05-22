const { generateMessage } = require("./message");
const { createActionStamp } = require("./actionstamp");

const generateBotResponse = async (command, messages) => {
  switch (command) {
    case "c_message":
      return await generateMessage(messages);
    case "c_actionstamp":
      return await createActionStamp(messages);
    default:
      return undefined;
  }
};

module.exports = {
  generateBotResponse,
};
