import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import { sendVerificationEmail } from '../util/sendVerificationEmail.js';

export const register = async (req, res) => {
    try {
        const { name, email, password, address } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: 'Email already used' });
        }

        // create verification token
        const verifyToken = crypto.randomBytes(32).toString('hex');

        const user = await User.create({
            name,
            email,
            password,
            address,
            verifyToken,
            verificationTokenExpires: Date.now() + 3600 * 1000 // 1 hour
        });

        // 🔥 SEND EMAIL (DO NOT BLOCK RESPONSE)
        try {
            await sendVerificationEmail(user.email, user.name, verifyToken);
        } catch (emailError) {
            console.error('EMAIL ERROR:', emailError.message);
            // ❗ DO NOT throw
        }

        // ✅ ALWAYS return success if user was saved
        return res.status(201).json({
            message: 'Registration successful. Please verify your email.'
        });
    } catch (error) {
        console.error('REGISTER ERROR:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};
export const verifyEmail = async (req, res) => {
    try {
      const { token } = req.params;
  
      const user = await User.findOne({
        verificationToken: token,
        verificationTokenExpires: { $gt: Date.now() }
      });
  
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      if (user.isVerified) {
        return res.json({ message: "Email already verified" });
      }
  
      user.isVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
  
      await user.save();
  
      res.json({
        message: "Email verified successfully! You can now login."
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// export const verifyEmail = async (req, res) => {
//     const { id, token } = req.query;
//     const user = await User.findById(id);
//     if (user.isVerified) {
//         return res.json({ message: 'Already verified' });
//     }
//     if (user.verifyToken !== token || Date.now() > user.verifyTokenExpiry) {
//         return res.status(400).json({ message: 'Token invalid or expired' });
//     }

//     if (!user) {
//         return res.status(400).json({ message: 'Invalid or expired link' });
//     }

//     user.isVerified = true;
//     user.verificationToken = undefined;
//     user.verificationTokenExpires = undefined;

//     await user.save();

//     res.json({ message: 'Email verified successfully!!, You can login.' });
// };

// export const verifyEmail = async (req, res) => {
//     const { id, token } = req.query;
//     const user = await User.findById(id);
//     if (!user) return res.status(400).json({ message: 'Invalid link' });
//     if (user.isVerified) return res.json({ message: 'Already verified' });
//     if (user.verifyToken !== token || Date.now() > user.verifyTokenExpiry)
//         return res.status(400).json({ message: 'Token invalid or expired' });
//     user.isVerified = true;
//     user.verifyToken = undefined;
//     user.verifyTokenExpiry = undefined;
//     await user.save();
//     res.json({ message: 'Email verified successfully!!, You can login' });
// };

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user.isVerified) {
        return res.status(403).json({
            message: 'Please verify your email before logging in.'
        });
    }
    if (!user) return res.status(400).json({ message: 'User not found' });
    // const ok = await user.comparePassword(password);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'password no match' });
    //if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
    res.json({ message: 'Login successful', token });
};

export const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
        return res.json({ message: 'If the email exists, a link was sent.' });
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = Date.now() + 60 * 60 * 1000;
    await user.save();
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&id=${user._id}`;
    await transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: user.email,
        subject: 'Reset password',
        html: `Reset here: <a href="${resetLink}">${resetLink}</a>`
    });
    res.json({ message: 'If the email exists, a link was sent.' });
};

export const resetPassword = async (req, res) => {
    const { id, token } = req.query;
    const { password } = req.body;
    const user = await User.findById(id);
    if (
        !user ||
        user.passwordResetToken !== token ||
        Date.now() > user.passwordResetExpiry
    )
        return res.status(400).json({ message: 'Invalid or expired token' });
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
};
