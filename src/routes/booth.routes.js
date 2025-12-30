const express = require('express');
const router = express.Router();
const boothController = require('../controllers/booth.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', boothController.getAll);
router.post('/', boothController.create);
router.get('/:id/leads', boothController.getLeads);

module.exports = router;
