const service = require('../services/campaigns.service');
const validate = require('../validators/campaigns.validator');

async function create(req, res) {
  res.status(201).json(await service.createCampaign(validate.createBody(req.body)));
}

async function get(req, res) {
  res.json(await service.getCampaign(validate.id(req.params.id)));
}

async function send(req, res) {
  res.json(await service.sendCampaign(validate.id(req.params.id)));
}

module.exports = { create, get, send };
