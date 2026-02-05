const fs = require("fs");
const path = require("path");

const setupUploadFolders = () => {
  const folders = [
    "public/uploads/categories",
    "public/uploads/customize",
    "public/uploads/products",
  ];

  folders.forEach((folder) => {
    const absolutePath = path.join(process.cwd(), folder);

    if (!fs.existsSync(absolutePath)) {
      try {
        fs.mkdirSync(absolutePath, { recursive: true });
        console.log(`Created folder: ${absolutePath}`);
      } catch (err) {
        console.error(`Error creating folder ${absolutePath}:`, err);
      }
    }
  });
};

module.exports = setupUploadFolders;
