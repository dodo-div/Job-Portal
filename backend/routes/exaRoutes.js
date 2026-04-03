const express = require('express');
const router = express.Router();
const { searchPeople } = require('../controllers/exaController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.post('/search-people', protect, authorizeRoles('employer', 'admin'), searchPeople);

module.exports = router;
