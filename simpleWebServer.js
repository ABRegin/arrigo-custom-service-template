import express from 'express'
import fs from 'fs'

const app = express()
const port = process.env.PORT || 3000
const dir = process.env.DIR || './'
const filelimit = process.env.LIMIT || 10000
app.get('/', (req, res) => {
    const start = Date.now(); 
    fs.readdir(dir, (err, files) => {
        if(err){
            res.status(500).send(err);
        }
        res.send(`<br/><pingdom_http_custom_check>
        <status><strong>${files.length>filelimit?'ERROR':'OK'}</strong></status>
        <response_time><strong>${Date.now()-start}</strong></response_time>
        </pingdom_http_custom_check><br/><br/>`);
    });
})
app.listen(port, ()=>console.log('server listening on ', port))