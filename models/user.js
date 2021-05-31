var mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },

    last_login: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
    },
    status: {
      type: String,
      default: "Pending",
    },
    code_verification: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
