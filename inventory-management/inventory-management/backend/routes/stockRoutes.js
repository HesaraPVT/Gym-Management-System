const express = require('express');
const router = express.Router();
const { getMovements, stockIn, stockOut } = require('../controllers/stockController');

router.get('/movements', getMovements);
router.post('/in', stockIn);
router.post('/out', stockOut);

module.exports = router;
