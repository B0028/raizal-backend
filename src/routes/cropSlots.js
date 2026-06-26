const express = require('express');
const router = express.Router();
const {
  getUserCropSlots,
  createCropSlots,
  updateCropSlots,
  deleteCropSlot
} = require('../controllers/cropSlotController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, getUserCropSlots);

router.post('/', authMiddleware, createCropSlots);

router.put('/', authMiddleware, updateCropSlots);

router.delete('/:slotId', authMiddleware, deleteCropSlot);

module.exports = router;
