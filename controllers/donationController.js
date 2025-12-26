// backend/controllers/donationController.js
import { supabase } from '../config/db.js';
import { initializePayment, verifyPayment } from '../services/paystackService.js';
import Joi from 'joi';

// Donation schema validation
const donationSchema = Joi.object({
  amount: Joi.number().min(1).required(),
  donor_name: Joi.string().required(),
  campaign: Joi.string().default('Offering') // default to 'Offering' if not provided
});

// Initialize donation
export const createDonation = async (req, res) => {
  try {
    const { error, value } = donationSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { amount, donor_name, campaign } = value;

    // Initialize Paystack payment (amount in kobo)
    const payment = await initializePayment({
      // Paystack requires an email field; you can use a default placeholder
      email: 'no-reply@church.org',
      amount: amount * 100
    });

    // Insert donation into Supabase table
    await supabase.from('donations').insert([
      {
        donor_name,
        amount,
        campaign,
        status: 'pending',
        reference: payment.data.reference
      }
    ]);

    res.json({
      authorization_url: payment.data.authorization_url || null,
      reference: payment.data.reference || null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Verify donation after Paystack callback
export const confirmDonation = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) return res.status(400).json({ error: 'Reference is required' });

    const payment = await verifyPayment(reference);

    if (payment.status === 'success') {
      await supabase.from('donations').update({ status: 'success' }).eq('reference', reference);
      return res.json({ message: 'Donation successful', data: payment });
    }

    res.status(400).json({ message: 'Donation not successful', data: payment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
