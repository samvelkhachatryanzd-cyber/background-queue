const { Router } = require('express');
const campaigns = require('../controllers/campaigns.controller');

const router = Router();

router.post('/campaigns', campaigns.create);
router.get('/campaigns/:id', campaigns.get);
router.post('/campaigns/:id/send', campaigns.send);

module.exports = router;
