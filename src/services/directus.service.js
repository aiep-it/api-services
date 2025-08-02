const directus = require("../config/directus");
const { readFile } = require("node:fs/promises");

const { updateItem, uploadFiles } = require("@directus/sdk");

exports.uploadFileToDirectus = async (file) => {
  try {
    const formData = new FormData();
    formData.append(
      "file",
      new Blob([file.buffer], { type: file.mimetype }),
      file.originalname
    );

    formData.append("folder", "59a775cb-2a67-42a5-ad25-fb054dac9dd0");

    const res = await directus.request(uploadFiles(formData));

    console.log("uploadFile res", res);
    return res.id;
    // return uploadedFile;
  } catch (error) {
    console.error("Error uploading file to Directus:", error);
    throw new Error(`Failed to upload file to Directus: ${error.message}`);
  }
};
