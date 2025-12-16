import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
name: { type: String, required: true },
email: { type: String, required: true, unique: true },
password: { type: String, required: true },
address: String,
role: { type: String, enum: ['user','admin','rider'], default: 'user' },
isVerified: { type: Boolean, default: false },
verifyToken: String,
verifyTokenExpiry: Date,
passwordResetToken: String,
passwordResetExpiry: Date
}, { timestamps: true });


// userSchema.pre('save', async function(next) {
// if (!this.isModified('password')) return next();
// const salt = await bcrypt.genSalt(10);
// this.password = await bcrypt.hash(this.password, salt);
// next();
// });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  });
  
  // Compare passwords
  userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
  };

  const User = mongoose.model("User", userSchema);
  export default User;