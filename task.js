const ENV = require('./environment');
const autobahn = require('autobahn');
const context = require('./context');

const connection = new autobahn.Connection({
    realm: ENV.realm,
    authid: ENV.key,
    authmethods: ["anonymous"],
    transports: [{
        url: `${ENV.url}`,
        type: 'websocket',
        protocols: ['wamp.2.msgpack']
    }],
    
});

const serviceName = 'arrigo-custom-service-task';

const ns = `accounts.${ENV.account.toLowerCase()}.services.${serviceName}`;

connection.onopen = async function (session) {
    console.log("Executing the task with a WAMP connection");
    //implement the task here

    connection.close();
};

connection.open(); 