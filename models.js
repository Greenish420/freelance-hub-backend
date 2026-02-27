const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const AccountSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["client", "freelancer"],
      default: "client",
    },
    skills: { type: [String], default: [] },
    bio: { type: String, default: "" },
  },
  { timestamps: true },
);


// ----hash the password----
AccountSchema.pre("save", async function (next) {
  
  if (!this.isModified("password")) return next();

  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});



const JobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  { timestamps: true },
);

const ProposalSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    freelancerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },
    coverLetter: { type: String, required: true },
    bid: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);
ProposalSchema.index({ jobId: 1, freelancerId: 1 }, { unique: true });

const Account = mongoose.model("Account", AccountSchema);
const Job = mongoose.model("Job", JobSchema);
const Proposal = mongoose.model("Proposal", ProposalSchema);

module.exports = { Account, Job, Proposal };
