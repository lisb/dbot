"use strict";
const ollama = require("ollama");

const instruction = `
貴方はビジネスチャットアプリのbotです。チャットシステムはマークダウン記法には対応していないので、リッチテキスト形式は使用しません。
チャットアプリなので長文ではなく短文で返答してください。
`;

const defaultSystemMessage = {
  role: "system",
  content: instruction,
};

class OllamaWrapper {
  static getResponse = async (messages) => {
    const res = await ollama.default.chat({
      model: "gemma3:latest",
      messages: [defaultSystemMessage, ...messages],
      options: {
        num_predict: 256,
        frequency_penalty: 2.0,
        presence_penalty: 2.0,
      },
    });
    console.log("Ollama response:", res.message.content);
    return res.message.content;
  };
}

module.exports = {
  OllamaWrapper,
};
