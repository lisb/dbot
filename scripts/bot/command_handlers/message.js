const { OllamaWrapper } = require("../../ollama_wrapper");

const defaultInstruction = `
貴方はビジネスチャットアプリのbotです。チャットシステムはマークダウン記法には対応していないので、リッチテキスト形式は使用しません。
`;

var instruction = process.env.DEFAULT_INSTRUCTION || defaultInstruction;

const defaultSystemMessage = [
  {
    role: "system",
    content: instruction,
  },
];

const generateMessage = async (messages, options) => {
  const response = await OllamaWrapper.getResponse(
    [...defaultSystemMessage, ...messages],
    options
  );
  return response.trim();
};

module.exports = {
  generateMessage,
};
