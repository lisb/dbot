const { generateBotResponse } = require("../command_handlers");

const fileHandler = (res, file, memory) => {
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
      const command = "c_message";
      const response = await generateBotResponse(command, [...memory, message]);
      if (!response) {
        return;
      }
      memory.push({ role: "user", content: message.content }); // NOTE: 画像データはメモリーしない
      memory.push({
        role: "assistant",
        content: response,
      });

      res.send(response);
    });
  };
  setTimeout(dl, 30000);
};

module.exports = {
  fileHandler,
};
