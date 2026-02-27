// imports
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const validateTokens = require("./MiddleWare/validateTokens");
const cors = require("cors");
const {
  register,
  login,
  upgradeToFreelancer,
  postJobs,
  getJobs,
  applyJobs,
  myJobs,
  myProposals,
  acceptProposal,
} = require("./routesFunctions");

dotenv.config();

// middleware
const app = express();

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI);

// constants

const Port = process.env.PORT || 5000;

// ----register----
app.post("/register", register);

// ----login----
app.post("/login", login);

// ----upgradingToFreelancer----
app.put("/upgradeToFreelancer", validateTokens, upgradeToFreelancer);

// ----postJob----
app.post("/postJobs", validateTokens, postJobs);

// ----getjobs----
app.get("/getJobs", validateTokens, getJobs);

// ----applyjobs----
app.post("/applyJobs/:jobId", validateTokens, applyJobs);

// ----myjobs----
app.get("/myJobs", validateTokens, myJobs);

// ----myProposals----
app.get("/myProposals/:jobId", validateTokens, myProposals);

// ----acceptProposal----
app.put("/acceptProposal/:proposalId", validateTokens, acceptProposal);

app.listen(Port, () => console.log(`server is running on port : ${Port}`));
