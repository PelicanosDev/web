const Resource = require('../models/Resource');
const { uploadDocument, uploadMedia, deleteImage } = require('../config/cloudinary');

const getAllResources = async (req, res) => {
  try {
    const filter = { isPublic: true };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.category) filter.category = req.query.category;

    const resources = await Resource.find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('uploadedBy', 'profile.firstName profile.lastName');

    res.json({ success: true, data: resources });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id).populate('uploadedBy', 'profile.firstName profile.lastName');
    if (!resource) return res.status(404).json({ success: false, message: 'Recurso no encontrado' });
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createResource = async (req, res) => {
  try {
    const { title, description, type, category, videoUrl, isPublic } = req.body;

    let fileUrl, publicId;

    if (req.file) {
      const isPdf = /pdf|doc|docx/.test(req.file.originalname.split('.').pop().toLowerCase());
      if (isPdf) {
        const result = await uploadDocument(req.file, 'pelicanos/documents');
        fileUrl = result.url;
        publicId = result.publicId;
      } else {
        const result = await uploadMedia(req.file, 'pelicanos/videos');
        fileUrl = result.url;
        publicId = result.publicId;
      }
    }

    const resource = await Resource.create({
      title,
      description,
      type,
      category: category || 'other',
      fileUrl,
      publicId,
      videoUrl: videoUrl || undefined,
      isPublic: isPublic !== undefined ? isPublic === 'true' || isPublic === true : true,
      uploadedBy: req.user.id,
    });

    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Recurso no encontrado' });

    const { title, description, type, category, videoUrl, isPublic } = req.body;

    if (req.file) {
      if (resource.publicId) {
        await deleteImage(resource.publicId).catch(() => {});
      }
      const isPdf = /pdf|doc|docx/.test(req.file.originalname.split('.').pop().toLowerCase());
      if (isPdf) {
        const result = await uploadDocument(req.file, 'pelicanos/documents');
        resource.fileUrl = result.url;
        resource.publicId = result.publicId;
      } else {
        const result = await uploadMedia(req.file, 'pelicanos/videos');
        resource.fileUrl = result.url;
        resource.publicId = result.publicId;
      }
    }

    if (title !== undefined) resource.title = title;
    if (description !== undefined) resource.description = description;
    if (type !== undefined) resource.type = type;
    if (category !== undefined) resource.category = category;
    if (videoUrl !== undefined) resource.videoUrl = videoUrl;
    if (isPublic !== undefined) resource.isPublic = isPublic === 'true' || isPublic === true;

    await resource.save();
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);
    if (!resource) return res.status(404).json({ success: false, message: 'Recurso no encontrado' });

    if (resource.publicId) {
      await deleteImage(resource.publicId).catch(() => {});
    }

    await resource.deleteOne();
    res.json({ success: true, message: 'Recurso eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllResources, getResourceById, createResource, updateResource, deleteResource };
