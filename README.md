# ChatGPT-style UI

A full-stack ChatGPT-style interface built with Vite, React, Tailwind CSS, and a Node.js + Express backend using static JSON data (no database).

## Features

-   **New Chat Flow**: Create sessions dynamically with backend-generated IDs.
-   **Session-Based Routing**: Each chat is loaded from  `/session/:sessionId`.
-   **Session History**: Sidebar lists all sessions and loads chat history on click.
-   **Structured Responses**: Displays both description + tabular data in chat.
-   **Feedback System**: Like 👍 / Dislike 👎 , Toggle, undo, update counts correctly , Per-user voting (clientId stored in localStorage)
-   **Theme System**: Light / Dark mode
                      -   Saves preference in localStorage
-   **Modern UI**:  Glassmorphism , Smooth animations, Loading states, Accessibility (Enter-to-send, ARIA labels)
-   **Responsive Design**: Sidebar collapses on mobile, Drawer UI for small screens

  






## Getting Started

### Prerequisites

-   Node.js (v18 or higher)
-   npm

### Project Structure 

  ```bash
chat-app/
│
├── backend/
│   ├── server.js
│   ├── mockData.js
│   ├── data/
│   │   ├── sessions.json
│   │   └── history.json
│   └── package.json
│
├── src/
│   ├── api.js
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   ├── pages/
│   │   ├── Landing.jsx
│   │   └── ChatPage.jsx
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   ├── ChatHeader.jsx
│   │   ├── ChatInput.jsx
│   │   ├── MessageItem.jsx
│   │   ├── MessageList.jsx
│   │   ├── TableView.jsx
│   │   ├── FeedbackButtons.jsx
│   │   └── ThemeToggle.jsx
│   └── ...
│
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env
 ```
### Installation & Running

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the development server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:5173` (or the next available port).

## Backend Setup 

1. **Move into backend folder:**

``` 
cd backend
```

2. **Install backend dependencies:**

```
npm install
```
3. **Start backend server:**

```
   npm run dev
  
```
**Backend API runs on:**

```
http://localhost:5000
```



## Backend Integration ( How can we Setup )

To connect it to a real backend, follow these steps:

1.  **Create an environment file:**

    Create a file named `.env` in the root of the project.

2.  **Set the API URL:**

    Add your backend's base URL to the `.env` file:
    ```
    VITE_API_URL=https://your-backend-api.com/api
    ```

3.  **Update the API functions:**

    Go to `src/api.js` and replace the mock Promise-based functions with actual `fetch` or `axios` calls to your backend endpoints. Use `import.meta.env.VITE_API_URL` to construct the request URLs.

    The stub functions to be replaced are:
    -   `newSession()`
    -   `getSessions()`
    -   `getHistory(sessionId)`
    -   `askQuestion(sessionId, question)`
    -   `sendFeedback(sessionId, entryId, action)`
