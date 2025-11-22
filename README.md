# Toohak Backend

Backend service for **Toohak**, a Kahoot-style quiz platform that allows admins to create and manage quizzes, and players to join sessions in real time.

This project was originally developed as part of a university software engineering course and has been adapted here as a personal portfolio project.

---

## 🚀 Features

- Admin registration, login and authentication
- Quiz creation, editing and deletion
- Question and answer management
- Session management (start, join, play, end)
- Player participation via session codes
- Server-side state management for users, quizzes and sessions
- Input validation and structured error responses
- Automated unit testing and linting

The HTTP API surface is documented via an OpenAPI/Swagger specification in [`swagger.yaml`](./swagger.yaml).

---

## 🛠 Tech Stack

- **Language:** TypeScript (Node.js)
- **Runtime:** Node.js
- **Testing:** Jest
- **Linting / Tooling:** ESLint, Babel
- **CI:** GitLab CI (originally) / suitable for GitHub Actions
- **Documentation:** OpenAPI (Swagger)

---

## 📁 Project Structure

```text
.
├── src/                # Application source code (business logic, routing, helpers)
├── jest.config.js      # Jest test configuration
├── .eslintrc.json      # Linting configuration
├── .babelrc            # Babel configuration
├── .gitlab-ci.yml      # CI pipeline (tests + linting, from original GitLab setup)
├── swagger.yaml        # OpenAPI/Swagger definition for the HTTP API
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation (this file)
```
---

## 🔧 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)  
- npm or yarn for package management  

### 1. Install dependencies

```bash
npm install
# or
yarn install
```

### 2. Start development server

```bash
npm run dev
# or
yarn dev
```

### 3. Run the test suite

```bash
npm test
# or
yarn test
```

### 4. Lint the code

```bash
npm run lint
# or
yarn lint
```

## 🧪 API Usage

The HTTP API is defined in `swagger.yaml`. To explore it:

1. Visit [Swagger Editor](https://editor.swagger.io/)
2. Copy the contents of `swagger.yaml` into the editor
3. Browse available endpoints, models, and try example requests

---

## 🧑‍💻 My Contributions

This backend service was developed as part of a university software engineering course.

Across this project I contributed to several core areas of the backend, including:

### **🔐 Authentication & User Management**
- Implemented and refined admin registration, login, logout and token authentication flows.
- Added and updated endpoints for user details and user profile updates.
- Fixed authentication edge cases and improved token handling behaviour.

### **💾 Persistence Layer (State Saving & Loading)**
- Added a full persistence system to load and save the backend datastore across server restarts.
- Integrated persistence into core helper functions to ensure data consistency.
- Implemented logic to load data on startup and safely clear data on server shutdown.
- Added automatic saving after API calls to maintain up-to-date state.

### **🧠 Quiz & Session Logic**
- Added validation logic for question positions and improved error handling for invalid states.
- Worked on session timing behaviour, including clearing/resetting timers to prevent stuck states.
- Contributed to player flows (join, status, question info) and integrated related feature branches.

### **🛠 API Coverage & General Backend Features**
- Added support for admin quiz updates such as thumbnail changes and question operations (move, duplicate, delete).
- Updated tests and adjusted backend behaviour to match API contract expectations.

### **🧹 Code Quality & Integration**
- Fixed linting issues, enforced consistent code style and improved comments across several files.
- Resolved merge conflicts and integrated numerous feature branches (e.g., `adminAuthLogin`, `playerJoin`, `hashPasswords`, `adminQuestionMove`).
- Updated wrapper and test files to maintain alignment with backend logic.
---
