const cloudinary = require("../config/cloudinary");

const uploadImage = (file, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.log(error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );
    uploadStream.end(file.buffer);
  });
};

const deleteImage = (image, folder) => {
  return new Promise((resolve, reject) => {
    let publicId = image;
    // Check if it's a URL and extract public_id
    if (image.startsWith("http")) {
        const parts = image.split("/upload/");
        if (parts.length > 1) {
            let path = parts[1];
            // Remove version if present (v12345/)
            if (path.startsWith("v")) {
                const versionIndex = path.indexOf("/");
                if (versionIndex !== -1) {
                    path = path.substring(versionIndex + 1);
                }
            }
            // Remove extension
            const lastDotIndex = path.lastIndexOf(".");
            if (lastDotIndex !== -1) {
                publicId = path.substring(0, lastDotIndex);
            } else {
                publicId = path;
            }
        }
    }

    // If publicId was not extracted correctly or it was just a filename, usage of folder prefix might be needed if not present?
    // But if we returned secure_url, the extracted path should be full public_id (folder/filename).
    // If it was legacy filename, publicID = filename.
    // Legacy logic relied on appending folder in delete logic?
    // Wait, previous deleteImage took (publicId, folder).
    // Cloudinary destroy takes public_id.
    // If it's a legacy file (just "filename.jpg"), and we migrated, it's NOT on Cloudinary yet unless we migrated data.
    // If it IS on Cloudinary (from previous steps where we returned public_id "folder/filename"), then publicId is correct.
    // If we passed "folder/filename", extracted publicId is "folder/filename". Correct.

    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
          console.log(error);
          return resolve(error);
      }
      resolve(result);
    });
  });
};

module.exports = { uploadImage, deleteImage };
