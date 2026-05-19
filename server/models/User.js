import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false, // Never return password by default
  },
  role: {
    type: String,
    enum: ['Tech Lead', 'Frontend Dev', 'Backend Dev', 'UX Designer', 'Product Manager', 'Developer'],
    default: 'Developer',
  },
  avatar: {
    type: String,
    default: '#6C5CE7', // Color code for avatar
  },
  initials: {
    type: String,
    maxlength: 3,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
}, {
  timestamps: true,
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate initials from name
userSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    const parts = this.name.split(' ');
    this.initials = parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : this.name.substring(0, 2).toUpperCase();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
