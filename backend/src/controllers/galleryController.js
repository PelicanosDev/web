const GalleryItem = require('../models/GalleryItem');
const { uploadImage, deleteImage } = require('../config/cloudinary');

const getAllGalleryItems = async (req, res, next) => {
  try {
    const { category, isPublic, page = 1, limit = 12 } = req.query;

    const query = {};
    
    if (category) query.category = category;
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';

    const items = await GalleryItem.find(query)
      .populate('uploadedBy', 'profile.firstName profile.lastName')
      .populate('eventId', 'title date')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await GalleryItem.countDocuments(query);

    res.status(200).json({
      success: true,
      data: items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getGalleryItemById = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id)
      .populate('uploadedBy', 'profile')
      .populate('eventId', 'title date')
      .populate('likes', 'profile.firstName profile.lastName');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const createGalleryItem = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    const result = await uploadImage(req.file, 'gallery');

    const item = await GalleryItem.create({
      ...req.body,
      imageUrl: result.url,
      thumbnailUrl: result.url,
      publicId: result.publicId,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const updateGalleryItem = async (req, res, next) => {
  try {
    let item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    if (req.file) {
      if (item.publicId) {
        await deleteImage(item.publicId);
      }
      
      const result = await uploadImage(req.file, 'gallery');
      req.body.imageUrl = result.url;
      req.body.publicId = result.publicId;
    }

    item = await GalleryItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

const deleteGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    if (item.publicId) {
      await deleteImage(item.publicId);
    }

    await item.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const likeGalleryItem = async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const userId = req.user.id;
    const isLiked = item.isLikedBy(userId);

    if (isLiked) {
      item.likes = item.likes.filter(id => id.toString() !== userId.toString());
    } else {
      item.likes.push(userId);
    }

    await item.save();

    res.status(200).json({
      success: true,
      data: {
        likes: item.getLikeCount(),
        isLiked: !isLiked
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  likeGalleryItem
};
