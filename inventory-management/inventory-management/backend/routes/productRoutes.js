const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', upload.single('photo'), createProduct);
router.put('/:id', upload.single('photo'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
