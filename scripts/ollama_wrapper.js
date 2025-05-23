"use strict";
const ollama = require("ollama");

const model = process.env.OLLAMA_MODEL || "gemma3:4b";
const needLog = process.env.OLLAMA_LOG || false;

class OllamaWrapper {
  static getResponse = async (
    messages,
    options = {
      num_predict: 256,
      frequency_penalty: 2.0,
      presence_penalty: 2.0,
    }
  ) => {
    const res = await ollama.default.chat({
      model: model,
      messages: [...messages],
      options,
    });
    if (needLog) {
      console.log("Ollama response:", res.message.content);
    }
    return res.message.content;
  };
}

module.exports = {
  OllamaWrapper,
};
