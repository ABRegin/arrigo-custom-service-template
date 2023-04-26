const ENV = require('./environment');
const fetch = require('node-fetch');

module.exports = function createContext(session, legacySession) {
    const dbPromise = function (type, sql, params, options) {
        return new Promise(function (resolve, reject) {
            if (typeof sql !== 'string' || !sql.length)
                reject("At least a query needs to be provided to sql query");

            let method = `accounts.${ENV.account.toLowerCase()}.services.db.${type}.query`;
            let callmeta = (options && options.callmeta) || {};
            callmeta.token = callmeta.token || ENV.key;
            let kwargs = (options && options.kwargs) || {};

            session.call(method.toLowerCase(), [sql, params || []], { ...kwargs, callmeta })
                .then((res) => {
                    options && options.result && options.result(res);
                    resolve(res);
                },
                    (err) => {
                        reject(err);
                    });
        });
    }
    const statePromise = function (type, path, options) {
        options = options || {};
        return new Promise(function (resolve, reject) {
            if (typeof (path) !== 'string')
                return reject("Path must be defined");

            if (type === 'set' && options.data === undefined)
                return reject("Set missing mandatory argument data");

            let service = (options && options.service) || 'state';
            let method = `accounts.${ENV.account.toLowerCase()}.services.${service}.${type}`;
            let callmeta = (options && options.callmeta) || {};
            callmeta.token = callmeta.token || ENV.key;

            let args;
            if (type === 'get')
                args = [path, options.key || null, options.file || null];
            if (type === 'set')
                args = [path, options.data || null, options.key || null, options.file || null];

            session.call(method.toLowerCase(), args, { callmeta })
                .then((res) => {
                    options && options.result && options.result(res);
                    resolve(res);
                },
                    (err) => {
                        reject(err);
                    });
        });
    }
    const callPromise = function (method, args, options) {
        return new Promise(function (resolve, reject) {
            let callmeta = (options && options.callmeta) || {};
            callmeta.token = callmeta.token || ENV.key;
            let kwargs = (options && options.kwargs) || {};
            session.call(method.toLowerCase(), args || [], { ...kwargs, callmeta }, { receive_progress: true })
                .then((res) => {
                    options && options.result && options.result(res);
                    resolve(res);
                },
                    (err) => {
                        reject(err);
                    },
                    (progress) => {
                        options.progress && options.progress(progress);
                    });
        });
    }
    const legacyCallPromise = function (method, args, options) {
        return new Promise(function (resolve, reject) {
            let callmeta = (options && options.callmeta) || {};
            callmeta.token = callmeta.token || ENV.key;
            let kwargs = (options && options.kwargs) || {};
            legacySession.call(method.toLowerCase(), args || [], { ...kwargs, callmeta }, { receive_progress: true })
                .then((res) => {
                    options && options.result && options.result(res);
                    resolve(res);
                },
                    (err) => {
                        reject(err);
                    },
                    (progress) => {
                        options.progress && options.progress(progress);
                    });
        });
    }
    return function (path) {
        return {
            state: {
                get: function (options) {
                    return statePromise('get', path, options)
                },
                set: function (options) {
                    return statePromise('set', path, options)
                },
            },
            db: {
                alarms: {
                    query: function (sql, params, options) {
                        return dbPromise('alarms', sql, params, options);
                    }
                },

                analogs: {
                    query: function (sql, params, options) {
                        return dbPromise('analogs', sql, params, options);
                    }
                },

                digitals: {
                    query: function (sql, params, options) {
                        return dbPromise('digitals', sql, params, options);
                    }
                },

                userlog: {
                    query: function (sql, params, options) {
                        return dbPromise('userlog', sql, params, options);
                    }
                },
            },
            call: function (method, args, options) {
                return callPromise(method, args, options);
            },
            legacy: {
                read: function (variables) {
                    return legacyCallPromise('read', [variables])
                },

                write: function (variable) {
                    if (!variable)
                        throw "variable parameter is missing in write call this function with write({value:theValue, variable:thevariable});"
                    if (variable.value === undefined)
                        throw "Value parameter is missing in write object";
                    if (variable.variable === undefined)
                        throw "Variable parameter is missing in write object";

                    return legacyCallPromise('write', [variable])
                },

                execute: function (str, paramNames, paramValues) {

                    str = str || ""
                    paramNames = paramNames || []
                    paramValues = paramValues || []

                    return legacyCallPromise('execute', [str, paramNames, paramValues, 'arrigo.ssf'])
                }
            },
            fetch: fetch,
        }
    }
}