require('dotenv').config({quiet: true});
const connectToMQ = require("./rabbitmq.connection");
const { Campaign } = require("../models");

const campaignPublish = async (msg) => {
  const queue = 'campaign';
  const conn = await connectToMQ();

  const ch = await conn.createChannel();
  ch.on('error', (err) => { console.error('Channel error:', err); });
  ch.on('handler-error', (err, event) => { console.error(`Uncaught exception in channel ${event} listener:`, err); });
  await ch.assertQueue(queue);

  const parsedMessage = JSON.parse(msg)

  ch.sendToQueue(queue, Buffer.from(msg), {persistent: true});
  await Campaign.update({ status: 'pending' }, { where: { id: parsedMessage.id } })

  await ch.close();
  await conn.close();
};

module.exports = campaignPublish;