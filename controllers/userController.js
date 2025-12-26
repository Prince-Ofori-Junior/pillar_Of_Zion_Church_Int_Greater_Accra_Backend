// backend/controllers/userController.js
import { supabase } from '../config/db.js';
import Joi from 'joi';

const updateUserSchema = Joi.object({
    name: Joi.string().optional(),
    role: Joi.string().valid('admin','pastor','member','volunteer').optional(),
    email: Joi.string().email().optional()
});

// Get all users (Admin)
export const getUsers = async (req, res) => {
    try {
        const { data, error } = await supabase.from('users').select('id, name, email, role, created_at');
        if (error) throw error;
        res.json({ users: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { error, value } = updateUserSchema.validate(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const { data, error: updateError } = await supabase
            .from('users')
            .update(value)
            .eq('id', userId)
            .select()
            .single();

        if (updateError) throw updateError;
        res.json({ message: 'User updated', user: data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
