const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    profession: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
    },
    // OAuth provider information
    providers: {
      google: {
        id: String,
        email: String,
      },
      github: {
        id: String,
        username: String,
        email: String,
      },
    },
    // Profile information
    avatar: {
      type: String,
      default: null,
    },
    // Account verification
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    // Timestamps
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt fields
  }
);

// Index for efficient queries
userSchema.index({ email: 1 });
userSchema.index({ "providers.google.id": 1 });
userSchema.index({ "providers.github.id": 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password") || !this.password) return next();

  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Static method to find user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to find user by OAuth provider
userSchema.statics.findByProvider = function (provider, id) {
  const query = {};
  query[`providers.${provider}.id`] = id;
  return this.findOne(query);
};

// Transform output to remove sensitive data
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
