const { Campaign, Delivery } = require('../models');
const { NotFoundError, ConflictError } = require('../utils/errors');
const campaignPublish = require('../rabbitmq/campaign.publisher')
const campaignWorker = require("../rabbitmq/campaign.consumer");

async function findCampaign(id) {
  const campaign = await Campaign.findByPk(id);
  if (!campaign) throw new NotFoundError(`Campaign ${id} not found`);
  return campaign;
}

async function getCampaign(id) {
  const campaign = await findCampaign(id);
  const sentCount = await Delivery.count({ where: { campaignId: id } });
  return { ...campaign.toJSON(), sentCount };
}

async function createCampaign(fields) {
  const campaign = await Campaign.create(fields);
  return getCampaign(campaign.id);
}

async function sendCampaign(id) {
  const campaign = await findCampaign(id);
  if (campaign.status === 'completed') throw new ConflictError(`Campaign ${id} has already been completed`);
  if (campaign.status !== 'draft') throw new ConflictError(`Campaign ${id} has already been sent`);

  await campaignPublish(JSON.stringify(campaign));

  return getCampaign(id);
}

module.exports = { getCampaign, createCampaign, sendCampaign };
