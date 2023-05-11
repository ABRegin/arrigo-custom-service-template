const fs = require('fs');
require('dotenv').config();
const argv = require('minimist')(process.argv.slice(2));

const wampdebug = process.env.WAMPDEBUG || argv.wampdebug || argv.d || 'off';

if ((argv.h || argv.help) !== undefined) {
    console.log('Usage:');
    console.log('\t -k -key      | env.KEY \t REQUIRED: Authkey for the router');
    console.log('\t -a -account  | env.ACCOUNT \t REQUIRED: Account name for procedure registration');
    console.log('\t -r -realm    | env.REALM \t The realm to connect to (default: realm1)');
    console.log('\t -u -url      | env.URL \t The url to connect to (default: ws://127.0.0.1:8080/ws)');
    console.log('\t -h -help                 \t Shows this help');
    return;
}

const key = process.env.KEY || argv.key || argv.k;
if (key === undefined) {
    throw new Error("No key provided! Try -h or -help for more info. Exiting...")
}

console.log(`key: ${key}`);


const realm = process.env.REALM || argv.realm || argv.r || "realm1";

console.log(`realm: ${realm}`);

const url = process.env.URL || argv.url || argv.u || "ws://127.0.0.1:8080/ws";

console.log(`url: ${url}`);

const account = process.env.ACCOUNT || argv.account || argv.a;

if (account === undefined) {
    throw new Error("No account provided! Try -h or -help for more info. Exiting...");
}
console.log(`account: ${account}`);

const projectPath = process.env.PROJECTPATH || argv.path || argv.p;

module.exports = { wampdebug, key, realm, url, account, projectPath }