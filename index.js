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

const serviceName = 'arrigo-custom-service-template';

const ns = `accounts.${ENV.account.toLowerCase()}.services.${serviceName}`;

connection.onopen = async function (session) {
    console.log("Connected, got new session!");

    try {
        await session.register(`${ns}.hello`, async (args, kwargs, details) => {
            return "Hello from service";
        });
    } catch (error) {
        console.log("Exception while registering methods", error)
        console.log("Exiting to be resurrected by the pm2 service manager");
        process.exit(1);
    }
};

connection.onclose = async function (reason, details) {
    if (reason === "closed" || reason === "lost") {
        console.log("Connection closed");
        console.log("Exiting to be resurrected by the pm2 service manager");
        process.exit(1);
    }
}

connection.open(); 