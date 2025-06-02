const { generateBotResponse } = require("../command_handlers");

const fileHandler = (res, file, memoryState) => {
  res.send("ファイルの検証が終わるまで少々お待ちください...");
  const dl = () => {
    res.download(file, async (path, err) => {
      if (err) {
        console.log("failed2:" + err.message);
        setTimeout(dl, 30000);
        return;
      }
      console.log("succeed2:" + path);
      const message = {
        role: "user",
        content: res.json.text ? res.json.text.replace("Hubot ", "") : "",
        images: [path],
      };
      const command = "c_message";
      const response = await generateBotResponse(res, command, [
        ...memoryState,
        message,
      ]);
      if (!response) {
        return;
      }
      memoryState.push({ role: "user", content: message.content }); // NOTE: 画像データはメモリーしない
      memoryState.push({
        role: "assistant",
        content: response,
      });

      res.send(response);
    });
  };
  // ファイル検証中が出る環境は特定の環境のみ
  setTimeout(dl, 0);
};

module.exports = {
  fileHandler,
};
