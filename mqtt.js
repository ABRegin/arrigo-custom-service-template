const ENV = require('./environment');
const autobahn = require('autobahn');
const context = require('./context');
var mqtt    = require('mqtt');


var mqttURL ="mqtt://test.mosquitto.org" ;
var mqttClientId = `arrigo-custom-services-mqtt-${Date.now()}`;

const serviceName = 'arrigo-custom-service-template';

const ns = `accounts.${ENV.account.toLowerCase()}.services.${serviceName}`;

const topicfile = require('fs').readFileSync('./testdata/mqtt-topics',{encoding:'utf8'});

const testTopics = topicfile.split('\n');

console.log(`Connecting to ${mqttURL}`);

var mqttClient  = mqtt.connect(mqttURL,{clientId:mqttClientId});

let currentSession = null;
let topicValueCache = {};

const wampConnection = new autobahn.Connection({
    realm: ENV.realm,
    authid: ENV.key,
    authmethods: ["anonymous"],
    transports: [{
        url: `${ENV.url}`,
        type: 'websocket',
        protocols: ['wamp.2.msgpack']
    }],
    
});
let wampchannelOpened = false;

mqttClient.on('error',console.log);

mqttClient.on('message',async function(topic, message, packet){
   console.log("adding to cache");
   topicValueCache[topic] = message;
   const result = await currentSession.call(`${ns}.read`);
    console.log('valueCache', result);
});

mqttClient.on("connect",function(){	
   console.log("Connected to mqtt broker, opening wamp chnanel");
    if(!wampchannelOpened){
        wampConnection.open();
        wampchannelOpened = true;
    }
 testTopics.forEach(topic => {
    mqttClient.subscribe(`${mqttClientId}`)
});


})
wampConnection.onopen = async function (session) {
    currentSession = session;

    console.log("Connected, got new session!");
    // public test message
    if(mqttClient.connected){
        console.log("publishing hello message")
        testTopics.forEach(topic=>{
            const fulltopic = `${mqttClientId}`
            console.log('publishing to', fulltopic);
            mqttClient.publish(fulltopic, `payload for ${topic}`);

        })
    }

    session.register(`${ns}.read`, async (args, kwargs, details) => {
        if(args[0] && topicValueCache[args[0]])
            return topicValueCache[args[0]];

        return topicValueCache;
    });


};

