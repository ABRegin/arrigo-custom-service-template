const ENV = require('./environment');
const autobahn = require('autobahn');
const context = require('./context');

//initiate wamp connection with correct settings.
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

// change the servicename to what it should be exposed in wamp topic namespace
const serviceName = 'arrigo-custom-service-template';

//use Arrigo wamp namespace structure to register a namespace for this service. 
const ns = `accounts.${ENV.account.toLowerCase()}.services.${serviceName}`;

connection.onopen = async function (session) {

    //Here is the session created callback. session object is used to call, register, publish and subscribe to events in the Arrigo Local wamp router. 
    
    //const result = await session.call(methodname, args, kwargs);

    //To be able to have access to the same context as in SSF, a Path sttring needs to be provided. 
    

    //To register a method, a call to session.register is made. 
    session.register(`${ns}.mymethod`, async (args, kwargs, details) => {
        
        const path = args[0];
        const sessionContext = context(session);

        const pathContext = sessionContext(path);
        
        await pathContext.state.set({data:{mydata:23,otherdata:3245}});

        const state = await pathContext.state.get();

        const result = await session.call(`accounts.${ENV.account.toLowerCase()}.services.ssf.execute`,[path, 'mySSF'],{kwargs:{arg1:"my first argument"}, _token:kwargs.token});

        console.log("Method callback",result, state );

        return result;
    
    }, { disclose_caller: true });
    
};

connection.open();