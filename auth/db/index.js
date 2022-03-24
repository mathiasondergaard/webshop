const mongoose = require('mongoose');
const logger = require('../utils/logger');
const Role = require('./models/role.model');
mongoose.Promise = global.Promise;

const moduleName = 'db/index.js -';

const roles = [
    'user',
    'moderator',
    'admin'
];

const initial = (roles) => {
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            roles.forEach(role => {
                new Role({
                    name: role 
                })
                .save(err => {
                    if (err) {
                        logger.error(`${moduleName} Unexpected error when adding roles ${JSON.stringify(err)}`);
                    }
                    logger.info(`${moduleName} Role added: ${role}`);
                });
            });
        }
    });
};

const initDb = async () => {
    await mongoose.connect(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}/${process.env.MONGO_DB}`, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        logger.info(`${moduleName} Database successfully initialized`);
        initial(roles);
    })
    .catch((err) => {
        logger.error(`${moduleName} Unexpected error when initializing database, exiting ${JSON.stringify(err)}`);
        process.exit();
    });
};

exports.initializeDatabase = initDb;
exports.ROLES = roles;