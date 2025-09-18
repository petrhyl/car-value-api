# Car Value API

## Overview
The Car Value API is a backend service built with [NestJS](https://nestjs.com/) and [TypeORM](https://typeorm.io/) to manage car reports, user authentication, and estimate car values based on various parameters. It supports PostgreSQL databases. Authentication is handled using JWT bearer.

## Features
- User authentication and authorization (JWT-based).
- Authentication tokens refreshing.
- Role-based access control (Admin, Moderator, User).
- User management (CRUD operations).
- CRUD operations for car reports.
- Car value estimation based on filters.
- Database migrations with TypeORM.
- Environment-specific configurations.

## Prerequisites
- Node.js >= 22.0.0
- PostgreSQL database

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd car-value
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env.development` file manually by copying variables from `.env.test`:
     ```bash
     cp .env.test .env.development
     ```
   - Update the `.env.development` file and set `DB_SCHEMA_SYNC` to `false` for development.

4. Create a Docker container with PostgreSQL database:
   ```bash
   docker compose --env-file .env.development up -d
   ```


5. Run application for the first time
   ```bash
   npm run build
   npm run migration:run
   npm run dev
   ```

## Scripts
- **Start Development Server:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Start Production Server:**
  ```bash
  npm run start:prod
  ```
- **Generate Migrations:**
  ```bash
  npm run migration:generate -- src/migrations/<migration-name>
  ```
- **Run pending Migrations:**
  ```bash
  npm run migration:run
  ```
- **Revert Migrations:**
  ```bash
  npm run migration:revert
  ```
- **Run Interactive Unit Tests:**
  ```bash
  npm run test:watch
  ```
- **Run End-to-End Tests:**
  ```bash
  npm run test:e2e
  ```

## API Endpoints
### Authentication
- **Sign Up:** `POST /api/auth/signup`
- **Login:** `POST /api/auth/login`
- **Logout:** `POST /api/auth/logout`
- **Refresh Token:** `POST /api/auth/refresh-token`
- **Get Authenticated User:** `GET /api/auth/current-user`

### Users
- **Create User:** `POST /api/users`
- **Get User by ID:** `GET /api/users/:id`
- **Get All Users:** `GET /api/users`
- **Update User:** `PUT /api/users/:id`
- **Delete User:** `DELETE /api/users/:id`

### Car Reports
- **Create Report:** `POST /api/reports`
- **Get List of Reports:** `GET /api/reports?limit=20&offset=0`
- **Get Report by ID:** `GET /api/reports/:id`
- **Update Report:** `PUT /api/reports/:id`
- **Delete Report:** `DELETE /api/reports/:id`
- **Estimate Car Value:** `GET /api/reports/estimate`

## Database Configuration
The project supports both PostgreSQL. Configure the database in the `.env` file:


## Deployment (deprecated)
1. Install the [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli).
2. Log in to Heroku:
   ```bash
   heroku login
   ```
3. Create a new Heroku app:
   ```bash
   heroku create car-value-api
   ```
4. Add Heroku Postgres add-on:
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   ```
5. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set DB_TYPE=postgres
   heroku config:set JWT_SECRET=top-secret-key
   ```
6. Deploy the application:
   ```bash
   git push heroku main
   ```
7. Run application by enabling the dyno:
   ```bash
   heroku ps:scale web=1
   ```