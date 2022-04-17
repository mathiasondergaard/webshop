const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mailer = require('../../../helpers/mailer');
const Token = require('./pwToken.model');
const {User} = require('../authentication');
const {auth_logger: logger} = require('../../../helpers/log');
const {AppError} = require("../../../error");

const moduleName = 'password.controller.js -';

exports.pwResetEmailGen = async (req, res, next) => {
    logger.info(`${moduleName} request to send password reset email: ${JSON.stringify(req.body)}`);

    // Send status 400 if req.body is empty
    if (!Object.keys(req.body).length) {
        logger.error(`${moduleName} empty body received`);
        return next(new AppError('Please provide a body!', 400, true));
    }

    // Find user, if no user exists, return message and status 400
    const user = await User.findOne({email: req.body.email}).exec();
    if (!user) {
        logger.error(`${moduleName} no match for user/email error ${JSON.stringify(req.body)}`);
        return next(new AppError('No user exists with given email', 404, true));
    }

    let token = await Token.findOne({userId: user._id}).exec();
    // Generate a token if one doesnt already exist
    if (!token) {
        logger.info(`${moduleName} generating new token`);
        token = await new Token({
            userId: user._id,
            token: crypto.randomBytes(32).toString('hex'),
        })
            .save();
    }

    // Link for password reset
    const link = `${process.env.AUTH_BASE}/pw-reset/${user._id}/${token.token}`;

    // Send email with password reset link as HTML
    await mailer.sendEmail(
        user.email,
        'Request to reset Password',
        `<h1>Greetings.</h1>
        <br/>
        <p>Please click the link in order to reset your password!<p>
        <br/>
        <br/>
        <a href=${link}>Link to reset password</a>
        <br/>
        <p>Kind regards</p>`
    );

    logger.info(`${moduleName} pw reset link successfully sent to user ${JSON.stringify(user._id)}`);
    res.status(200).send('Password reset link successfully sent to your email account.');
};

exports.pwReset = async (req, res) => {
    try {
        logger.info(`${moduleName} request to reset password for userId: ${JSON.stringify(req.params.id)}`);

        // Send status 400 if req.body is empty
        if (!req.body) {
            return res.status(400).send({message: 'Invalid/no password supplied'});
        }

        // Find user, if no user exists, return message and status 400
        const user = await User.findById(req.params.id).exec();
        if (!user) {
            logger.error(`${moduleName} password reset user id not valid ${JSON.stringify(req.params.id)}`);
            res.status(400).send({message: 'No user matches id'});
            return;
        }

        const token = await Token.findOne({userId: user._id, token: req.params.token,}).exec();
        if (!token) {
            logger.error(`${moduleName} password reset token not valid ${JSON.stringify(req.params.token)}`);
            res.status(400).send({message: 'Invalid link or token expired'});
            return;
        }

        user.password = bcrypt.hashSync(req.body.password);
        await user.save();
        await token.delete();

        logger.info(`${moduleName} password reset completed for userId: ${JSON.stringify(req.params.id)}`);
        res.status(200).send('Password successfully reset');

    } catch (e) {
        logger.error(`${moduleName} send password reset link (find user) unexpected error ${JSON.stringify(e)}`);
        return res.status(500).end();
    }
};

