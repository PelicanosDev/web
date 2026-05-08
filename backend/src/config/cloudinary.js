const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (file, folder = 'pelicanos') => {
  try {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'auto',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' },
        { fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Error uploading image: ${error.message}`);
  }
};

const uploadMedia = async (file, folder = 'pelicanos') => {
  const isVideo = file.mimetype.startsWith('video/');
  if (!isVideo) {
    return uploadImage(file, folder);
  }
  try {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      resource_type: 'video',
    });

    // Generate a thumbnail from the first frame
    const thumbnailUrl = result.secure_url.replace('/upload/', '/upload/so_0,w_400,h_400,c_fill,q_auto/').replace(/\.[^.]+$/, '.jpg');

    return {
      url: result.secure_url,
      publicId: result.public_id,
      mediaType: 'video',
      thumbnailUrl,
    };
  } catch (error) {
    throw new Error(`Error uploading video: ${error.message}`);
  }
};

const uploadDocument = async (file, folder = 'pelicanos/documents') => {
  try {
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'raw',
    });
    return { url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    throw new Error(`Error uploading document: ${error.message}`);
  }
};

const deleteImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Error deleting image: ${error.message}`);
  }
};

module.exports = { uploadImage, uploadMedia, uploadDocument, deleteImage };
