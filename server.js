// imports
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const validationUtility = require("./Utilities/validationUtility");
const validateToken = require("./MiddleWare/ValidateToken");
const cors = require("cors");
dotenv.config();

// middleware
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

// schemas
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

// models

const Account = mongoose.model("Account", AccountSchema);
const Job = mongoose.model("Job", JobSchema);
const Proposal = mongoose.model("Proposal", ProposalSchema);

// constants

const Port = process.env.PORT || 5000;
const TokenKey = process.env.TOKEN_KEY;

// routes

// ----register----

app.post("/register", async (req, res) => {
  const { email, password, name } = req.body;

  //validating inputs
  const validationErrors = [];

  const emailCheck = validationUtility("email", email);
  const passCheck = validationUtility("password", password);
  const nameCheck = validationUtility("name", name);

  if (!emailCheck.isValid) validationErrors.push(emailCheck.message);
  if (!passCheck.isValid) validationErrors.push(passCheck.message);
  if (!nameCheck.isValid) validationErrors.push(nameCheck.message);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  // trying to add the inputs into the db
  try {
    if (!(await Account.exists({ email }))) {
      const newAccount = { email: email, password: password, name: name };
      const user = await Account.create(newAccount);

      const token = jwt.sign({ id: user._id }, TokenKey, { expiresIn: "1d" });

      return res
        .status(201)
        .json({ email: newAccount.email, name: newAccount.name, token: token });
    } else {
      return res.status(409).json({
        message: "an account exists with this email try loggin in instead",
      });
    }
  } catch (err) {
    return res.status(500).json({ message: "an unknown error occured ", err });
  }
});

// ----login----
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  //validating inputs
  const validationErrors = [];

  const emailCheck = validationUtility("email", email);
  const passCheck = validationUtility("password", password);

  if (!emailCheck.isValid) validationErrors.push(emailCheck.message);
  if (!passCheck.isValid) validationErrors.push(passCheck.message);

  if (validationErrors.length > 0) {
    return res.status(400).json({
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  try {
    const userAccount = await Account.findOne({ email: email });
    if (userAccount) {
      if (userAccount.password == password) {
        const token = jwt.sign(
          {
            id: userAccount._id,
          },
          TokenKey,
          { expiresIn: "1d" },
        );
        return res.status(200).json({
          user: {
            id: userAccount._id,
            name: userAccount.name,
            email: userAccount.email,
            role: userAccount.role,
            bio: userAccount.bio,
            skills: userAccount.skills,
          },
          token: token,
        });
      } else {
        return res
          .status(400)
          .json({ message: "the password or the email is wrong" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "the password or the email is wrong" });
    }
  } catch (err) {
    return res.status(500).json({ message: "an unknown error occured ", err });
  }
});
// ----upgradingToFreelancer----
app.put("/upgradeToFreelancer", validateToken, async (req, res) => {
  const { skills, bio } = req.body;
  const validationErrors = [];

  const bioCheck = validationUtility("bio", bio);
  const skillsCheck = validationUtility("skills", skills);

  if (!bioCheck.isValid) validationErrors.push(bioCheck.message);
  if (!skillsCheck.isValid) validationErrors.push(skillsCheck.message);

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    const userAccount = await Account.findById(req.id);
    if (userAccount.role === "client") {
      userAccount.role = "freelancer";
      userAccount.bio = bio;
      userAccount.skills = skills;

      await userAccount.save();

      return res.status(200).json({ message: "operation done succefully" });
    } else {
      return res.status(200).json({ message: "operation done succefully" });
    }
  } catch (err) {
    return res.status(500).json({ message: "an unknown error occured" });
  }
});

// ----postJob----
app.post("/postJob", validateToken, async (req, res) => {
  const { title, description, budget } = req.body;
  const validationErrors = [];

  const titleCheck = validationUtility("title", title);
  const descriptionCheck = validationUtility("description", description);
  const budgetCheck = validationUtility("budget", budget);

  if (!titleCheck.isValid) validationErrors.push(titleCheck.message);
  if (!descriptionCheck.isValid)
    validationErrors.push(descriptionCheck.message);
  if (!budgetCheck.isValid) validationErrors.push(budgetCheck.message);

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  const userId = req.id;

  try {
    const newJob = {
      title: title,
      description: description,
      budget: budget,
      postedBy: userId,
    };
    await Job.create(newJob);
    return res
      .status(201)
      .json({ message: "job created succussfully", job: newJob });
  } catch (err) {
    return res.status(500).json({ message: "an unknown error occured" });
  }
});

// ----getjobs----
app.get("/getJobs", validateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ status: "open" })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("postedBy", "name bio");
    return res.status(200).json(jobs);
  } catch (err) {
    return res.status(500).json({ message: "unknown error ocurred" });
  }
});

// ----applyjobs----
app.post("/applyJobs/:jobId", validateToken, async (req, res) => {
  const userId = req.id;
  const jobId = req.params.jobId;
  const { bid, coverLetter } = req.body;

  const validationErrors = [];

  const coverLetterCheck = validationUtility("description", coverLetter);
  const bidCheck = validationUtility("budget", bid);

  if (!coverLetterCheck.isValid)
    validationErrors.push(coverLetterCheck.message);
  if (!bidCheck.isValid) validationErrors.push(bidCheck.message);

  if (validationErrors.length > 0) {
    return res.status(400).json({ errors: validationErrors });
  }

  try {
    if (!(await Job.exists({ _id: jobId }))) {
      return res.status(401).json({ message: "this job doesnt exist" });
    }
    const currentJob = await Job.findById(jobId);
    if (userId === currentJob.postedBy.toString()) {
      return res
        .status(401)
        .json({ message: "users cant apply to their own jobs" });
    }

    const userAccount = await Account.findById(userId);
    if (userAccount.role != "freelancer") {
      return res
        .status(401)
        .json({ message: "user must be a freelancer to apply to a job" });
    }

    const newProposal = {
      jobId: jobId,
      freelancerId: userId,
      coverLetter: coverLetter,
      bid: bid,
    };
    await Proposal.create(newProposal);
    return res
      .status(200)
      .json({ message: "job applied to succusfully", newProposal });
  } catch (err) {
    return res.status(500).json({ message: "an unknown error ocurred" });
  }
});

// ----myjobs----
app.get("/myJobs", validateToken, async (req, res) => {
  const userId = req.id;
  try {
    const usersJobs = await Job.find({ postedBy: userId }).sort({
      createdAt: -1,
    });
    return res
      .status(200)
      .json({ message: "jobs imported succusfully", usersJobs });
  } catch (err) {
    return res.status(500).json({ message: "an unknown error ocurred" });
  }
});

app.get("/myProposals/:jobId", validateToken, async (req, res) => {
  const userId = req.id;
  const jobId = req.params.jobId;

  try {
    const myjob = await Job.findOne({ _id: jobId, postedBy: userId });
    if (!myjob) {
      return res.status(403).json({
        message:
          "either the job doesnt exist , or you arent authorized to do this action",
      });
    }

    const myProposals = await Proposal.find({ jobId: jobId })
      .sort({
        createdAt: -1,
      })
      .populate("freelancerId", "name bio skills");

    return res
      .status(200)
      .json({ message: "proposals imported succusfully", myProposals });
  } catch (err) {
    return res.status(500).json({ message: "an unknown error ocurred" });
  }
});

app.put("/acceptProposal/:proposalId", validateToken, async (req, res) => {
  const userId = req.id;
  const proposalId = req.params.proposalId;

  try {
    const proposal = await Proposal.findById(proposalId);
    if (!proposal)
      return res.status(404).json({ message: "Proposal not found" });

    const job = await Job.findById(proposal.jobId);

    if (job.postedBy.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "you are not authorized to do this action" });
    }
    proposal.status = "accepted";
    job.status = "closed";
    await proposal.save();
    await job.save();

    await Proposal.updateMany(
      {
        jobId: job._id,
        status: "pending",
        _id: { $ne: proposalId },
      },
      { status: "rejected" },
    );

    return res
      .status(200)
      .json({ message: "Hired! All other pending applications rejected." });
  } catch (err) {
    return res.status(500).json({ message: "an unknown error ocurred" });
  }
});

app.listen(Port, () => console.log(`server is running on port : ${Port}`));
