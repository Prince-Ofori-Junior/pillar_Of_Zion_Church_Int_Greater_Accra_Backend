// backend/config/paystack.js
import axios from 'axios';

export const paystackClient = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    },
});

// Usage in services:
// import { paystackClient } from '../config/paystack.js';
// paystackClient.post('/transaction/initialize', { email, amount });
