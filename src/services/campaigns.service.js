const { Campaign, Subscriber, Delivery } = require('../models');
const mailer = require('./mailer');
const { NotFoundError, ConflictError } = require('../utils/errors');

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
  if (campaign.status === 'sent') throw new ConflictError(`Campaign ${id} has already been sent`);

  const subscribers = await Subscriber.findAll({ order: [['id', 'ASC']] });

  for (const subscriber of subscribers) {
    await mailer.send({
      to: subscriber.email,
      subject: campaign.subject,
      text: `Hi ${subscriber.name},\n\n${campaign.body}`,
    });
    await Delivery.create({ campaignId: campaign.id, subscriberId: subscriber.id });
  }

  await campaign.update({ status: 'sent', sentAt: new Date() });
  return getCampaign(id);
}

module.exports = { getCampaign, createCampaign, sendCampaign };
