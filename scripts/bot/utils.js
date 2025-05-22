const isFileJSON = (text) => {
  try {
    const json = JSON.parse(text);
    if (json.files || json.file_id) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

module.exports = {
  isFileJSON,
};
