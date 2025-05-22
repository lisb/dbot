const { generateMessage } = require("./message");
const { createActionStamp } = require("./actionstamp");
const { createNote } = require("./note");

const generateBotResponse = async (res, command, messages) => {
  switch (command) {
    case "c_message":
      return await generateMessage(messages);
    case "c_actionstamp":
      return await createActionStamp(messages);
    case "c_note":
      res.send("ノートを作成中...(これには時間がかかります)");
      return await createNote(messages);
    default:
      return undefined;
  }
};

module.exports = {
  generateBotResponse,
};
