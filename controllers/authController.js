// backend/controllers/authController.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';
import { sendOTP } from '../services/twilioService.js';
import Joi from 'joi';

// Validation schema
const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin','pastor','member','volunteer').default('member')
});

// Register new user
export const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, password, role } = value;

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data, error: insertError } = await supabase
      .from('users')
      .insert([{ name, email, password: hashedPassword, role }])
      .select()
      .single();

    if (insertError) throw insertError;

    // Send welcome OTP/email safely
    try {
      await sendOTP(email, `Welcome to the Church Portal, ${name}!`);
    } catch (otpErr) {
      console.error('OTP send failed (ignored):', otpErr.message);
    }

    // Return success response
    res.status(201).json({
      message: 'User registered successfully',
      user: { id: data.id, name, email, role }
    });

  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Fetch user safely
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .maybeSingle(); // <- returns null instead of throwing if no row

        console.log("Login attempt:", { email, password });
        console.log("User from DB:", user, "Error from Supabase:", error);

        if (error) {
            console.error('Supabase fetch error:', error);
            return res.status(500).json({ error: 'Database error' });
        }

        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, role: user.role, email: user.email }
        });

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: err.message });
    }
};

  
// Password reset request
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (!user) return res.status(400).json({ error: 'Email not registered' });

        // Generate OTP or reset token
        const resetToken = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        await supabase.from('password_resets').upsert({ user_id: user.id, token: resetToken });

        await sendOTP(email, `Your password reset code is: ${resetToken}`);

        res.json({ message: 'Password reset OTP sent to email' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
