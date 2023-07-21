try {
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
} catch (error) {
    console.log("Exception while registering methods", error)
    console.log("Exiting to be resurrected by the pm2 service manager");
    process.exit(1);
}