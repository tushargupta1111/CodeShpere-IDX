# CodeSphere

## What is CodeSphere?

CodeSphere is a web-based code editor and collaboration platform built with React, Vite, and Socket.IO. It enables developers to edit code together in real time while running code directly inside the browser or via remote execution services.

## Key Features

- Real-time collaborative editing with Socket.IO
- Multi-language editor with live language switching
- Built-in execution support for:
  - JavaScript (sandboxed iframe)
  - Python (Pyodide in browser)
  - Java, C, C++, PHP (Judge0 public API)
- Room-based collaboration with join/leave notifications
- Live client list and shared room state
- Responsive React UI with Tailwind CSS styling

## Architecture

### Frontend
- React + Vite
- Tailwind CSS styling
- Socket.IO client for real-time collaboration
- In-browser execution for JavaScript and Python
- Remote execution via Judge0 for compiled languages

### Backend
- Node.js + Express
- Socket.IO server for room lifecycle and event broadcasting
- Stores room state in memory for late join synchronization
- Static file hosting support for production builds

## Supported Languages

- `javascript`
- `python`
- `java`
- `c`
- `cpp`
- `php`

## Getting Started

### Prerequisites

- Node.js installed
- npm available

### Install dependencies

From the repository root:

```bash
git clone https://github.com/tushargupta1111/CodeSphere-IDX.git
cd CodeSphere-IDX
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### Run locally

1. Start the backend server:

```bash
cd ../backend
npm run dev
```

2. Start the frontend development server:

```bash
cd ../frontend
npm run dev
```

3. Open the frontend in your browser at `http://localhost:5173`

## Environment Configuration

The frontend uses `VITE_SERVER_URL` to connect to the Socket.IO backend. By default it points to `http://localhost:4000`.

If you need to configure a custom backend URL, add a `.env` file in `frontend/` with:

```env
VITE_SERVER_URL=http://localhost:4000
```

## How Collaboration Works

- A user creates or joins a room by entering a room ID and username.
- Socket.IO synchronizes code and language selection for all connected clients.
- When a new user joins, the current room code and language are sent to them automatically.
- Users can copy the room ID to invite others.

## Execution Engine

CodeSphere runs code using a hybrid execution model:

- JavaScript: sandboxed iframe
- Python: browser-based Pyodide runtime
- Java/C/C++/PHP: Judge0 public API

> Note: Judge0 may require a free RapidAPI key for reliable usage.

## Project Structure

- `backend/` — Express + Socket.IO backend
- `frontend/` — React + Vite frontend
- `frontend/src/Services/useSocket.js` — real-time socket manager
- `frontend/src/Services/Executor.js` — code execution logic
- `frontend/src/Pages/EditorRoom.jsx` — collaboration editor UI

## Contributing

Contributions are welcome! Suggested workflow:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your work: `git commit -m "Add feature description"`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a pull request

## License

This project is licensed under the MIT License.
