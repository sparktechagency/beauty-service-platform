import nodemailer from 'nodemailer';
import config from '../config';
import { errorLogger, logger } from '../shared/logger';
import { ISendEmail } from '../types/email';

const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: Number(config.email.port),
    secure: false,
    auth: {
        user: config.email.user,
        pass: config.email.pass
    },
});

const sendEmail = async (values: ISendEmail) => {
    try {
        const info = await transporter.sendMail({
            from: `"Ooh Ah" <no-reply@oohahplatform.com>`,
            to: values.to,
            subject: values.subject,
            html: values.html,
        });
  
        logger.info('Mail send successfully', info.accepted);
    } catch (error) {
        errorLogger.error('Email', error);
    }
};

// sendmail by sandgrid
const sendEmailBySendGrid = async (values: ISendEmail) => {
    try {
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(config.sandgrid.api_key);

        const msg = {
            to: values.to,
            from: config.sandgrid.email,
            subject: values.subject,
            html: values.html,
        };

        sgMail.send(msg).then(() => {
            logger.info('Mail send successfully');
        }).catch((error:any) => {
            errorLogger.error('Email', error);
        });
    }catch (error) {
        errorLogger.error('Email', error);
    }
}

export const emailHelper = {
    sendEmail
};