const express = require('express');
const router = express.Router();
const fareController = require('../controllers/fare.controller');

router.get('/', fareController.getFares);
router.get('/regions', fareController.getRegions);

module.exports = router;


