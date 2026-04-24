## ⚙️ Tech Stack

- Next.js 16
- Better Auth
- TypeScript
- shadcn/ui
- Tailwind CSS
- React Hook Form
- Zod

## 🤖 Features

- **Authentication** with Better Auth (Google, GitHub)

## 🧙‍♂️ Run Project

Make sure you have the following installed on your machine:

- Git
- Node.js
- npm

#### Cloning the Repository and install
```
git clone https://github.com/BartoszStachowski/nextjs_MyOverflow.git
cd nextjs_MyOverflow
npm install
```

#### Set Up Environment Variables
Create a new file named .env.local in the root of your project and add the following content:


```dotenv
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

AUTH_GITHUB_CLIENT_ID=
AUTH_GITHUB_CLIENT_SECRET=

AUTH_GOOGLE_CLIENT_ID=
AUTH_GOOGLE_CLIENT_SECRET=
```

Replace the placeholder values with your actual credentials. You can obtain these credentials by signing up on the respective websites

#### Running the Project
```
npm run dev
```
