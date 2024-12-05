# Project Name

## Demo Video

Check out the demo video for the project here: [Demo Video](https://drive.google.com/file/d/1Vg5BOYo8eziKmW-3yS0EqjTaNxvh5jGs/view?usp=sharing)

## Project Structure

This project consists of three main folders:

- **backend**: Contains the Express-based backend server with WebSocket (ws) support.
- **frontend-admin**: React.js-based frontend for admin users with login functionality.
- **frontend-user**: React.js-based frontend for regular users.

## Installation & Setup

### Steps to run the project

1. Clone the repository:

    ```bash
    git clone https://github.com/tanish1120/crickscore.git
    ```

2. **Backend Setup**

    Navigate to the `backend` folder:

    ```bash
    cd backend
    ```

    Install dependencies:

    ```bash
    npm install
    ```

    Configure your MongoDB connection string. If using a local MongoDB setup, the default connection string might look like:

    ```bash
    mongodb://localhost:27017/cricket
    ```

    If using MongoDB Atlas or a different remote setup, replace the connection string accordingly.


    Start the backend server:

    ```bash
    npm run start
    ```

3. **Frontend Admin Setup**

    Navigate to the `frontend-admin` folder:

    ```bash
    cd frontend-admin
    ```

    Install dependencies:

    ```bash
    npm install
    ```

    Start the admin frontend:

    ```bash
    npm run start
    ```

4. **Frontend User Setup**

    Navigate to the `frontend-user` folder:

    ```bash
    cd frontend-user
    ```

    Install dependencies:

    ```bash
    npm install
    ```

    Start the user frontend:

    ```bash
    npm run start
    ```

## Project Overview

- **Backend**: Built with Express.js and WebSocket support via the ws library for real-time communication.
  
- **Frontend Admin**: React.js application for administrative task with login/signup using jwt.

- **Frontend User**: React.js application for regular users to interact with the platform.
