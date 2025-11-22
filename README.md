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

## 👤 Role & Context

This backend service was developed as part of a university software engineering course.

My personal contributions included:

- Implementing core backend logic and state management for authentication, quizzes and testing
- Setting up automated unit tests for the CI pipeline
- Refactoring code for readability, modularity, and maintainability
---
