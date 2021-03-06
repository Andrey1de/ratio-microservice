
const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const log4js = require('log4js');
const mongoose = require('mongoose');
const SwaggerExpress = require('swagger-express-mw');
const jsyaml = require('js-yaml');

const messages = require('./api/messages/ratio-microservice.messages');

const logger = log4js.getLogger('server');
const app = express();

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/rates';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

//log4js configuration
log4js.configure({
    appenders: { 'out': { type: 'stdout' },server: { type: 'multiFile', base: 'logs/', property: 'categoryName', extension: '.log', maxLogSize:52428800, backups: 3, compress: true } },
    categories: { default: { appenders: ['out','server'], level: LOG_LEVEL } }
});

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());

//logging each request
app.use((req, res, next)=>{
    logger.info(req.method,req.headers['x-forwarded-for'] || req.connection.remoteAddress,req.path);
    // res.setHeader('Access-Control-Allow-Origin','*');
    // res.setHeader('Access-Control-Allow-Methods','*');
    // res.setHeader('Access-Control-Allow-Headers','*');
    next();
});

//checking mongodb is available
app.use((req, res, next)=>{
    if (mongoose.connections.length == 0 || mongoose.connections[0].readyState != 1) {
        mongoose.connect(MONGO_URL, (err) => {
            if (err) {
                logger.error(err);
                res.status(500).json({ message: messages.error['500'] });
            } else {
                next();
            }
        });
    }else{
        next();
    }
});

app.use(express.static(path.join(__dirname, 'apidoc')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'apidoc', 'index.html'));
});
app.get('/swagger', (req, res) => {
    const content = fs.readFileSync(path.join(__dirname, 'api', 'swagger', 'ratio-microservice.swagger.yaml'), 'utf8');
    res.json(jsyaml.safeLoad(content, 'utf8'));
});

mongoose.connect(MONGO_URL, (err) => {
    if (err) {
        logger.error(err);
        process.exit(0);
    }else{
        logger.info('Connected to Database');
    }
});

SwaggerExpress.create({
    appRoot: __dirname,
    swaggerFile: path.join(__dirname, 'api', 'swagger', 'ratio-microservice.swagger.yaml')
}, (err, swaggerExpress) => {
    if (err) { throw err; }
    swaggerExpress.register(app);
    // Error handler
    app.use((err, req, res, next) => {
        logger.error(err);
        if (req.headers['content-type'] && req.headers['content-type'].indexOf('application/json') > -1) {
            if (err.statusCode == 404 || err.statusCode == 405) {
                res.status(404).json({ message: messages.error['404'] });
            } else {
                res.status(500).json(err);
            }
        } else {
            next();
        }
    });
    app.listen(PORT, (err) => {
        if (err) {
            logger.error(err);
        }else{
            logger.info('Server started on port ' + PORT);
        }
    });
});
    