// backend/utils/validators.js
import Joi from 'joi';

// Email validation schema
export const emailSchema = Joi.string().email().required();

// Password validation schema
export const passwordSchema = Joi.string().min(6).required();

// Name validation schema
export const nameSchema = Joi.string().min(3).required();

// General function to validate any schema
export const validate = (schema, data) => {
    const { error, value } = schema.validate(data, { abortEarly: false });
    if (error) {
        const messages = error.details.map((d) => d.message).join(', ');
        throw new Error(messages);
    }
    return value; 
};
