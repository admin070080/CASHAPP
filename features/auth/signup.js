import express from 'express';
import { validateSignupData, hashPassword, createUser } from '../../utils/authHelpers.js';
import { sendResponse } from '../../utils/responseHandler.js';

// File: /Users/macbook/Downloads/cashapp-mvp/features/auth/signup.js


const router = express.Router();

// POST /signup - User signup route
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Validate input data
        const validationError = validateSignupData({ email, password, name });
        if (validationError) {
            return sendResponse(res, 400, { error: validationError });
        }

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create the user in the database
        const newUser = await createUser({ email, name, password: hashedPassword });

        // Respond with success
        sendResponse(res, 201, { message: 'User created successfully', user: newUser });
    } catch (error) {
        console.error('Signup Error:', error);
        sendResponse(res, 500, { error: 'Internal Server Error' });
    }
});

export default router;