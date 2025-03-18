# Baat-Cheet backend

Welcome to the Backend of Baat-Cheet! This is designed to handle user authentication and websocket logic of **Baat-Cheet**. It uses Express.js as the web application framework, along with various other libraries such as ws,  CORS, cookie-parser, jsonwebtoken and Mongoose. The application provides routes for user **signup**, **signin**, and **validating user tokens**. It also includes middleware for **checking user duplicacy** and ensuring that only authenticated users can access certain routes.


## Live Demo
- [Link]() (coming soon)

## Features
1. **User Authentication** : Secure user authentication using JSON Web Tokens (JWT) and cookies.

2. **User Registration** : Allows users to register and create a new account with a unique username and email.

3. **User Duplicacy Check** : Prevents the creation of duplicate user accounts with the same username or email.

4. **API Response and error handling** : Custom response and error handling for API responses with status codes, messages, and data.

5. **Websockets** : Used to handle real-time communication.

## Installation & Setup Instructions

1. Clone the repository to your local machine using the following command:
`git clone https://github.com/Dhairya2505/baat_cheet_backend.git`

2. Navigate to the project directory : `cd baat_cheet_backend`

3. Install the dependencies : `npm install`

4. Create a `.env` file in the root directory of the project and add the following environment variables :
`SECRET_KEY = your-jwt-secret-key` ( random complex string as a key )
`MONGO_URL = your-mongo-url`

5. Start the server : `npm start` or `npm run dev`

The server will start on the default port 8000.

That's it! You can now access the API at `http://localhost:8000`.

## Technologies Used

- **Programming Language**: TypeScript
- **WebSocket**: For real-time communication between the server and clients.
- **Express**: For creating the server and handling HTTP requests.
- **Node.js**: For running the server-side JavaScript code.
