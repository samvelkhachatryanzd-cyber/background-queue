require('dotenv').config({quiet: true});
const connectToMQ = require('./rabbitmq.connection');
const { Campaign, Subscriber, Delivery } = require('../models');
const { send } = require("../services/mailer");

const campaignWorker = async () => {
  const queue = 'campaign';
  const conn = await connectToMQ();

  const ch = await conn.createChannel();
  ch.on('error', (err) => { console.error('Channel error:', err); });
  ch.on('handler-error', (err, event) => { console.error(`Uncaught exception in channel ${event} listener:`, err); });

  const subscribers = await Subscriber.findAll({ order: [['id', 'ASC']] });

  await ch.assertQueue(queue);
  await ch.prefetch(2);


  await ch.consume(queue, async (msg) => {
    if (msg !== null) {
      console.log('Received:', msg.content.toString());
      const parsedMessage = JSON.parse(msg.content.toString())
      try {
      await Campaign.update({ status: 'processing' }, { where: { id: parsedMessage.id } });
        for (const subscriber of subscribers) {
          const deliveryExists = await Delivery.findOne({ where: { campaignId: parsedMessage.id, subscriberId: subscriber.id } })
          if(!deliveryExists) {
            try {
              await send({
                to: subscriber.email,
                subject: parsedMessage.subject,
                text: `Hi ${subscriber.name},\n\n${parsedMessage.body}`,
              });
              await Delivery.create({ campaignId: parsedMessage.id, subscriberId: subscriber.id } );
            } catch (error){
              ch.nack(msg, false, true);
              console.log(error);
            }
          }
        }
        ch.ack(msg);
        await Campaign.update( { status: 'completed', sentAt: new Date(), failureMessage: null }, { where: { id: parsedMessage.id } });
      } catch (error) {
        ch.nack(msg, false, false);
        console.log(error);
        await Campaign.update( { status: 'failed', failureMessage: error.message }, { where: { id: parsedMessage.id } });
        throw error;
      }
    }
  });
};

module.exports = campaignWorker;