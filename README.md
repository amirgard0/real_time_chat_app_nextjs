



## Description
real_time_chat_app_nextjs is a group chat application built with Next.js and TypeScript. It provides real-time communication features using Socket.IO for instant messaging.



## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)
- [Important Links](#important-links)
- [Footer](#footer)



## Features
- **Real-time Messaging**: Utilizes Socket.IO for instant message delivery.
- **Group Chat**: Supports multiple users in a single chat room.
- **Private Chat**: Allows users to have private one-on-one conversations.
- **Online Status**: Indicates whether a user is online or displays their last seen time.
- **User Authentication**: Implements user registration and login.
- **Group Creation**: Allows users to create new chat groups.
- **Message History**: Stores and retrieves recent messages.
- **Command Execution**: Supports commands like clearing messages or deleting groups.
- **Online status subscriptions**: Users can subscribe to the online status of other users.



## Tech Stack
- **Framework**: React, Next.js
- **Language**: TypeScript
- **Styling**: Tailwind CSS, tw-animate-css
- **Realtime**: Socket.IO
- **Database**: Prisma
- **Authentication**: NextAuth.js
- **UI Components**: Radix UI



## Installation
1.  **Clone the repository:**

    ```bash
    git clone https://github.com/amirgard0/real_time_chat_app_nextjs
    cd real_time_chat_app_nextjs
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up the database:**

    ```bash
    npx prisma migrate dev
    ```

4.  **Environment variables:**
    *   Create `.env` file at the root of the project

    ```
    NEXTAUTH_SECRET=<your_secret>
    ```



## Usage
1.  **Run the development server:**

    ```bash
    npm run dev:next
    npm run dev:server
    ```

2.  **Open your browser and navigate to** `http://localhost:3000` to view the application.



### Real world use cases of that project
*   **Community Forums**: Create dedicated spaces for users to discuss shared interests.
*   **Team Collaboration**: Facilitate real-time communication within project teams.
*   **Customer Support**: Provide instant assistance to customers.
*   **Online Events**: Host live Q&A sessions and interactive discussions.
*   **Social Networking**: Build a platform for users to connect and chat in real-time.



### How to use
*   **Register an account** or log in.
*   **Join the global chat** or create a new group.
*   **Send messages** in real-time.
*   **Use commands** like `/clear` or `/deleteGroup` in groups where you have permission.
*   **Start private chats** with other users.



## Project Structure
```
real_time_chat_app_nextjs/
├── .vscode/
├── prisma/
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── chat/
│   │   ├── group/
│   │   ├── login/
│   │   ├── page.tsx
│   │   ├── private/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── custom/
│   │   └── ui/
│   ├── hooks/
│   ├── lib/
│   └── providers/
├── .eslintrc.json
├── components.json
├── next.config.js
├── package.json
├── postcss.config.js
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

*   `src/app`: Contains the Next.js application routes and pages.
*   `src/components`: Includes reusable React components.
*   `src/lib`: Contains utility functions and configurations.
*   `prisma`: Contains the Prisma database schema and migrations.
*   `server.ts`: Socket.IO server configuration.



## API Reference
The application uses Socket.IO for real-time communication. Here are some of the key Socket.IO events:

-   `connection`: Event emitted when a client connects to the server.
-   `disconnect`: Event emitted when a client disconnects from the server.
-   `joinGroup`: Event to join a specific group.
-   `leaveGroup`: Event to leave a group.
-   `sendMessage`: Event to send a message to a group.
-   `createGroup`: Event to create a new group.
-   `joinGlobal`: Event to join the global chat room.
-   `sendPrivateMessage`: Event to send a private message to a user.
-   `joinPrivateChat`: Event to join a private chat with a user.
-   `onlineStatus`: Event emitted to let users know the status(online/offline) of other users.



## Contributing
Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them.
4.  Submit a pull request.



## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## Important Links
*   **GitHub Repository**: [https://github.com/amirgard0/real_time_chat_app_nextjs](https://github.com/amirgard0/real_time_chat_app_nextjs)



## Footer
real_time_chat_app_nextjs - [https://github.com/amirgard0/real_time_chat_app_nextjs](https://github.com/amirgard0/real_time_chat_app_nextjs) - Author: amirgard0

Feel free to fork, star, and open issues to help improve this project!

<p align="center">This Readme generated by <a href="https://www.readmecodegen.com/">ReadmeCodeGen</a>.</p>