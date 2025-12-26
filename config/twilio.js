// backend/config/twilio.js
import twilio from 'twilio';

export const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
 
// Usage in services:
// import { twilioClient } from '../config/twilio.js';
// twilioClient.messages.create({ body, from, to });
