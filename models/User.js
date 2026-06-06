import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
  name: {
    type: String,
    default: "" // Default empty string taaki frontend par undefined na aaye
  },
  bio: {
    type: String,
    default: "" // 🔥 Yeh bio field add kar diya
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  contact: {
    type: String,
  },
  address: {
    type: String,
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'block'],
    default: "active"
  }
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
  }
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePswd = function (userPswd) {
  return bcrypt.compare(userPswd, this.password);
};

const User = mongoose.model('user', userSchema);

export default User;
