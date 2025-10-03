<img width="1919" height="877" alt="image" src="https://github.com/user-attachments/assets/91a5d238-8a44-48d4-ba6d-c0bbdb2e487e" />

# Mini-CMS for EdTech Test Project
A simple Content Management System (CMS) built as a test project for a Full-Stack Software Engineer role. The app allows users to create, read, update, and delete (CRUD) blog articles, organized in a tree structure by categories, with a rich text editor for article management. It includes basic authentication using Supabase Auth.

## Features

- Article Management: Create, edit, delete, and preview articles with title, slug, content (markdown), and category.
- Tree View Navigation: Displays categories as a collapsible tree with nested articles for easy navigation.
- Rich Text Editor: Edit article content with a markdown-compatible editor.
- Basic Authentication: Optional sign-in/sign-out using Supabase Auth (email/password) to restrict article creation/editing to authenticated users.
- Responsive UI: Clean, intuitive interface styled with Tailwind CSS.
- Deployment: Deployed on Vercel with a live demo.

## Tech Stack

- Frontend: Remix (React) for routing and server-side rendering, Tailwind CSS for styling.
- Backend: Remix server routes, Prisma ORM for database operations.
- Database: PostgreSQL (via Supabase).
- Authentication: Supabase Auth for email/password-based login.
- Deployment: Vercel for hosting the application.

## Prerequisites

- Node.js (v18 or later)
- PostgreSQL database (Supabase recommended)
- Supabase account for authentication and database
- Vercel account for deployment

## Setup Instructions
1. **Clone the Repository**
```
git clone https://github.com/your-username/mini-cms.git
cd mini-cms
```

2. **Install Dependencies**
```
npm install
```

3. **Configure Environment Variables**
Create a .env file in the root directory and copy the variables in .env.example:
```
cp .env.example .env
```

Update .env with your Supabase credentials:
```
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
DATABASE_URL="postgresql://postgres.[project_ref]:[YOUR-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project_ref]:[YOUR-PASSWORD]@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
NODE_ENV=development (production when deploying)
```

4. **Set Up the Database**

Ensure your PostgreSQL database is running (via Supabase or local Postgres).
Run Prisma migrations to set up the database schema:
```
npx prisma migrate dev --name init
```

5. **Run the Application Locally**
```
npm run dev
```

The app will be available at http://localhost:5173.

6. **Deploy to Vercel**

Push the repository to GitHub.
Connect the repository to Vercel via the Vercel dashboard.
Add the environment variables `(SUPABASE_URL, SUPABASE_ANON_KEY, DATABASE_URL)` in Vercel’s settings.
Deploy the app. The live demo will be available at the provided Vercel URL.

## Database Schema
The app uses a single Article table with the following structure (defined in prisma/schema.prisma):
```
model Article {
  id                    String                    @id @default(cuid())
  title                 String
  slug                  String                    @unique
  content               String
  parentId              String?
  parent                Article?                   @relation("ArticleHierarchy", fields: [parentId], references: [id])
  children              Article[]                  @relation("ArticleHierarchy")
  createdAt             DateTime                   @default(now())
  updatedAt             DateTime                   @updatedAt
}
```

parentId enables the tree structure by linking articles to parent categories.
Prisma handles CRUD operations and relationships.

Usage

Sign In: Use the /auth/login route to sign in with email/password (via Supabase Auth).
Manage Articles:
Navigate to /articles to view the article list (table view).
Go to /editor to create/edit articles in the rich text editor with a collapsible tree view for categories and articles.


## CRUD Operations:
- Create: Add a new article via the editor.
- Read: View articles in the table or editor.
- Update: Edit article details in the editor.
- Delete: Remove articles from the table view.


**Tree Navigation**: In the editor, expand/collapse categories to view nested articles and select one to edit.

## Live Demo
[live demo](https://minicms-iota.vercel.app)

## Notes

Authentication is implemented but can be skipped if time is limited, as it’s optional.
- The tree view is implemented using a recursive React component for scalability.
- Prisma migrations ensure easy database setup and schema consistency.

## Troubleshooting

Auth Errors: If you encounter refresh_token_not_found errors (as seen in logs), ensure the Supabase SUPABASE_URL and SUPABASE_ANON_KEY are correctly set in .env. Also, verify that the Supabase Auth session is active and refresh tokens are not expired.
Database Issues: Run npx prisma migrate reset to reset and reapply migrations if schema issues occur.
Vite HMR Issues: If HMR updates fail, restart the dev server (npm run dev) or clear the Vite cache.