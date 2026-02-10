# Toohak – Real-Time Quiz Platform Backend

Backend API for **Toohak**, a Kahoot-style quiz platform supporting admin quiz management and real-time player sessions.

**🌐 Live API:** https://toohak-backend.onrender.com/docs

Explore the interactive API documentation and try endpoints directly in your browser.

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
- **Documentation:** OpenAPI (Swagger)

---

## 📁 Project Structure
```text
.
├── src/                # Application source code (business logic, routing, helpers)
├── jest.config.js      # Jest test configuration
├── swagger.yaml        # OpenAPI/Swagger definition for the HTTP API
├── package.json        # Project dependencies and scripts
├── tsconfig.json       # TypeScript configuration
└── README.md           # Project documentation (this file)
```

---

## 🌐 Live Demo

**Try it:**
```bash
# Health check
curl https://toohak-backend.onrender.com/health

# View API documentation
open https://toohak-backend.onrender.com/docs
```

---

## 🔧 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)  
- npm or yarn for package management  

### 1. Install dependencies
```bash
npm install
```

### 2. Start development server
```bash
npm run dev
```

### 3. Build for production
```bash
npm run build
npm start
```

### 4. Run the test suite
```bash
npm test
```

### 5. Lint the code
```bash
npm run lint
```

---

## 🧪 API Usage

The HTTP API is defined in `swagger.yaml`. Once deployed, you can explore it at the `/docs` endpoint, or:

1. Visit [Swagger Editor](https://editor.swagger.io/)
2. Copy the contents of `swagger.yaml` into the editor
3. Browse available endpoints, models, and try example requests

---

## 🧑‍💻 About This Project

This backend service was developed as a full-stack software engineering project at UNSW, where I implemented core backend architecture, authentication flows, session management, and state persistence.

**Key technical contributions:**
- RESTful API design with 40+ endpoints documented via OpenAPI/Swagger
- Authentication system with token-based session management
- Real-time quiz session state management and player coordination
- Data persistence layer for server restarts
- Comprehensive test suite with Jest (150+ tests)

---

## 🚀 Deployment

This application is deployed on Render with:
- Automatic deployments from master branch
- Health check monitoring
- Environment variable management