// const { bucket } = require("../config/firebase");
// const path = require("path");

// const uploadImage = (file, folder) => {
//   return new Promise((resolve, reject) => {
//     if (!bucket) {
//         // Fallback or error if bucket is not initialized (e.g. key missing)
//         return reject("Firebase storage bucket not initialized");
//     }
//     const newFileName = `${Date.now()}_${file.originalname}`;
//     const blob = bucket.file(`${folder}/${newFileName}`);
//     const blobStream = blob.createWriteStream({
//       resumable: false,
//       metadata: {
//         contentType: file.mimetype,
//       },
//     });

//     blobStream.on("error", (error) => {
//       reject(error);
//     });

//     blobStream.on("finish", async () => {
//         // We can make the file public, or just sign it, or use the public URL if the bucket is public.
//         // For simplicity in this blueprint, we'll assume we just want the filename to store in DB
//         // and we'll construct the URL on the client or server as needed,
//         // OR we can return the media link.
//         // Existing app stores "filename" in DB and expects to find it in "public/uploads/..."
//         // If we change to Firebase, we might want to store the full URL or keep the filename and change how the frontend fetches it.
//         // Given the constraints, let's return the filename and we'll see if we need to adjust the frontend or serve a redirect.
//         // Actually, for Firebase, usually we store the Full URL or a path.
//         // But the current frontend does: src={`${apiURL}/uploads/products/${product.pImages[0]}`}
//         // We probably need to change the Frontend to handle external URLs if we store the full Firebase URL.
//         // OR we can make a proxy route on the server.
//         // Let's stick to storing the filename for now, but usually it involves a path.

//         // For the "blueprint", let's assume we return the filename that allows us to retrieve it later.
//       resolve(newFileName);
//     });

//     blobStream.end(file.buffer);
//   });
// };

// const deleteImage = (filename, folder) => {
//   return new Promise((resolve, reject) => {
//       if (!bucket) return resolve("No bucket"); // Fail safe
//       const file = bucket.file(`${folder}/${filename}`);
//       file.delete().then(() => {
//           resolve("Deleted");
//       }).catch(err => {
//           // If file doesn't exist, just resolve
//           resolve("Ignored");
//       })
//   });
// }

// module.exports = { uploadImage, deleteImage };
