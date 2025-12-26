// backend/services/paystackService.js
import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

export const initializePayment = async ({ email, amount }) => {
    try {
        const response = await axios.post(
            `${PAYSTACK_BASE_URL}/transaction/initialize`,
            { email, amount: amount * 100 }, // amount in kobo
            {
                headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` }
            }
        );
        return response.data;
    } catch (err) {
        throw new Error(err.response?.data?.message || err.message);
    }
};

export const verifyPayment = async (reference) => {
    try {
        const response = await axios.get(
            `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
            { headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` } }
        );
        return response.data.data; // contains status, amount, etc.
    } catch (err) {
        throw new Error(err.response?.data?.message || err.message);
    }
};
