var mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
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
    created_at: {
      type: Date,
      dafault: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
    last_login: {
      type: Date,
      default: Date.now,
    },
    active: {
      type: Boolean,
    },
    status: {
      type: Boolean,
    },
    code_varification: {
      type: String,
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
