import { model, Schema } from 'mongoose';

//! Schema for User model
const userSchema = new Schema(
  {
    username: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      required: false,
      default: 'https://ac.goit.global/fullstack/react/default-avatar.jpg',
    },
  },
  {
    timestamps: true,
  }
);

//! Pre-save hook to set username if not provided
userSchema.pre('save', function () {
  if (!this.username) {
    this.username = this.email.split('@')[0];
  }
});

//! Method to exclude password from returned user object
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

export const User = model('User', userSchema);
