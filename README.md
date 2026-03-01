Marketplace Backend (V2) — Professional Architecture
Author: [Greenish420]

Date: March 1, 2026

Status: Completed (Core Logic & Refactoring)

Overview
This project represents a significant evolution from basic CRUD applications to a professional, scalable marketplace infrastructure. It is designed to handle the complex interactions between clients and freelancers, emphasizing secure authentication, relational data integrity, and a modular code structure.

Architectural Standards & Scalability
The codebase has been intentionally engineered for long-term maintenance and team scalability through the following patterns:

Controller-Router Decoupling: By moving business logic out of the route definitions and into standalone controller functions, the system achieves a clean separation of concerns. This allows for independent testing of logic and ensures the entry point remains a high-level map of the API.

Modular Schema Design: Data is partitioned into specific models (Account, Job, Proposal) that utilize Mongoose's relational capabilities (ref and populate). This structure allows the database to grow in complexity without creating a "monolith" of data.

Middleware Pipeline: Security and session management are handled via a reusable middleware layer. This allows for "pluggable" security, where new protected routes can be secured instantly by injecting the validation layer.

Stateless Authentication: Utilizing JWT (JSON Web Tokens) ensures the backend remains stateless, allowing it to scale horizontally across multiple servers if traffic demands increase.

Tech Stack
Server: Node.js, Express.js

Database: MongoDB via Mongoose

Security: JWT, Bcrypt Hashing, CORS

Environment: Dotenv for secure variable management

Data Architecture
The backend manages a sophisticated relational flow between three core entities:

Account: Implements Role-Based Access Control (RBAC) with distinct permissions for client and freelancer roles.

Job: Managed by clients; includes status tracking and budget validation.

Proposal: Acts as the transactional bridge. It includes a unique compound index { jobId, freelancerId } at the database level to enforce business rules and prevent duplicate submissions.

Key Technical Features
Automated Status Management: The hiring flow is architected to be atomic—accepting a proposal automatically closes the parent job and updates all competing proposals to a 'rejected' status.

Centralized Validation: A dedicated utility layer handles input sanitization for emails, passwords, and currency, ensuring data consistency before reaching the persistence layer.

Sanitized Data Responses: All API returns are filtered to prevent sensitive information (like password hashes) from being sent to the client-side.

## API Documentation

### Authentication & Profile
| Method | Endpoint | Access | Description |
|:--- |:--- |:--- |:--- |
| **POST** | `/register` | Public | Creates a new account with default 'client' role. |
| **POST** | `/login` | Public | Authenticates user and returns a signed JWT. |
| **PUT** | `/upgradeToFreelancer` | Private | Transitions role to 'freelancer' and updates bio/skills. |

### Job Management
| Method | Endpoint | Access | Description |
|:--- |:--- |:--- |:--- |
| **POST** | `/postJobs` | Client | Creates a new job posting. |
| **GET** | `/getJobs` | Private | Fetches the 15 most recent open job postings. |
| **GET** | `/myJobs` | Client | Retrieves all jobs posted by the authenticated user. |

### Proposal & Hiring Flow
| Method | Endpoint | Access | Description |
|:--- |:--- |:--- |:--- |
| **POST** | `/applyJobs/:jobId` | Freelancer | Submits a proposal for a specific job. |
| **GET** | `/myProposals/:jobId` | Client | Views all proposals submitted for a specific job. |
| **PUT** | `/acceptProposal/:id` | Client | Hires freelancer, closes job, and rejects other bids. |
