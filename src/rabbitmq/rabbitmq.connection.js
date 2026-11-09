const amqplib = require('amqplib');
require('dotenv').config({quiet: true});

const connectToMQ = async () => {
  const conn = await amqplib.connect({
    protocol: 'amqp',
    hostname: 'localhost',
    port: process.env.RABBITMQ_PORT,
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });
  conn.on('error', (err) => { console.error('Connection error:', err); });
  conn.on('handler-error', (err, event) => { console.error(`Uncaught exception in connection ${event} listener:`, err); });

  return conn;
};

module.exports = connectToMQ;