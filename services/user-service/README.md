# User Service

The **User Service** is a Node.js microservice responsible for user management and authentication within the MiniShop application.

It provides REST APIs for user-related operations, stores user information in **MongoDB**, and uses **JSON Web Tokens (JWT)** for authentication and authorization.

## Architecture

```text
                    MiniShop Application
                           │
                           ▼
                    ┌──────────────┐
                    │ Admin Panel  │
                    └──────┬───────┘
                           │
                           │ HTTP
                           ▼
                  ┌───────────────────┐
                  │    User Service   │
                  │       :3001       │
                  └────────┬──────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
             ┌──────────┐      ┌────────────┐
             │ MongoDB  │      │    JWT     │
             │  Users   │      │Authentication│
             └──────────┘      └────────────┘
```

---

# Features

The User Service provides functionality for:

* User registration
* User authentication/login
* User management
* User data persistence
* JWT-based authentication
* JWT token expiration
* Protected API routes
* MongoDB integration
* REST API endpoints
* Docker containerization
* Kubernetes deployment support

---

# Technology Stack

| Technology | Purpose                 |
| ---------- | ----------------------- |
| Node.js    | Application runtime     |
| Express.js | REST API framework      |
| MongoDB    | User database           |
| Mongoose   | MongoDB object modeling |
| JWT        | Authentication          |
| Docker     | Containerization        |
| Kubernetes | Container orchestration |

---

# Project Structure

```text
user-service/
│
├── config/
│   └── ...
│
├── controller/
│   └── ...
│
├── model/
│   └── ...
│
├── routes/
│   └── ...
│
├── .dockerignore
├── .env
├── .env.example
├── .gitignore
├── Dockerfile
├── index.js
├── package.json
├── package-lock.json
└── README.md
```

## Directory Description

### `config/`

Contains application and database configuration.

### `controller/`

Contains business logic for user-related operations.

### `model/`

Contains MongoDB/Mongoose user models.

### `routes/`

Contains REST API route definitions.

### `index.js`

The main entry point of the User Service.

---

# Environment Configuration

The service uses environment variables for configuration.

The `.env.example` file contains:

```env id="9x3kpf"
PORT=3001

MONGO_URI=

JWT_SECRET=
JWT_EXPIRES_IN=
```

Create a local `.env` file from the example.

### Windows PowerShell

```powershell id="p7w2nk"
Copy-Item .env.example .env
```

### Linux/macOS

```bash id="q4j8sv"
cp .env.example .env
```

---

# Environment Variables

## PORT

Defines the HTTP port on which the User Service runs.

```env id="h5v9qa"
PORT=3001
```

The service will be available locally at:

```text id="z8c2md"
http://localhost:3001
```

---

# MongoDB Configuration

The User Service stores user information in MongoDB.

Configure the database connection using:

```env id="f3n7rx"
MONGO_URI=
```

For a local MongoDB installation:

```env id="w6k1pt"
MONGO_URI=mongodb://localhost:27017/minishop
```

If MongoDB is running inside Docker Compose using the service name `mongodb`:

```env id="m8q4yc"
MONGO_URI=mongodb://mongodb:27017/minishop
```

### MongoDB Resources

[MongoDB Official Website](https://www.mongodb.com/?utm_source=chatgpt.com)

[MongoDB Documentation](https://www.mongodb.com/docs/?utm_source=chatgpt.com)

---

# JWT Authentication

The User Service uses **JSON Web Tokens (JWT)** to authenticate users.

## JWT Secret

Configure a strong secret through:

```env id="c5v8wd"
JWT_SECRET=<your-secret>
```

The secret is used to sign and verify authentication tokens.

> **Important:** Never commit `JWT_SECRET` to Git or expose it in application logs.

## JWT Expiration

Configure the token lifetime using:

```env id="n2j6ks"
JWT_EXPIRES_IN=1d
```

Examples of supported expiration values include:

```text
15m
1h
1d
7d
```

The exact value should match the application's authentication requirements.

---

# Authentication Flow

A typical authentication flow is:

```text id="y4p8bz"
              User
                │
                │ Login
                ▼
        ┌────────────────┐
        │  User Service  │
        └───────┬────────┘
                │
                ▼
             MongoDB
                │
                │ Verify user
                ▼
        ┌────────────────┐
        │ Generate JWT   │
        └───────┬────────┘
                │
                ▼
              Client
                │
                │ JWT
                ▼
        Protected API
                │
                ▼
        JWT Verification
```

The client sends the JWT with requests to protected endpoints.

A common HTTP authorization format is:

```text id="q8w2jf"
Authorization: Bearer <token>
```

---

# Local Development

Install dependencies:

```bash id="r6v1xm"
npm install
```

Create the environment file:

```bash id="c4n9pk"
cp .env.example .env
```

Configure the required values:

```env id="s7h3dq"
PORT=3001

MONGO_URI=mongodb://localhost:27017/minishop

JWT_SECRET=<your-secret>
JWT_EXPIRES_IN=1d
```

Start the service:

```bash id="u9k5rc"
npm start
```

If a development script is available:

```bash id="e3m8vf"
npm run dev
```

---

# Docker

The User Service contains a `Dockerfile` for containerized deployment.

## Build Image

From the User Service directory:

```bash id="w2r7mx"
docker build -t minishop-user-service .
```

## Run Container

```bash id="j8f4qn"
docker run -p 3001:3001 --env-file .env minishop-user-service
```

The service will then be available at:

```text id="a6c2yd"
http://localhost:3001
```

---

# Docker Compose

When running the service with Docker Compose, use Docker service names for internal communication.

For example, if MongoDB is defined as:

```yaml id="x4k7pq"
services:
  mongodb:
    image: mongo
```

The User Service should connect using:

```env id="v8m2fz"
MONGO_URI=mongodb://mongodb:27017/minishop
```

Do not use `localhost` for communication between containers.

---

# Kubernetes Deployment

The User Service can be deployed as a Kubernetes workload.

A typical architecture is:

```text id="n6p3xw"
                    Ingress
                       │
                       ▼
                User Service
                    :3001
                       │
                       ▼
                   MongoDB
```

The Kubernetes `Service` should expose port `3001` and route traffic to the application container.

Sensitive environment variables should be stored in Kubernetes Secrets.

For example:

```yaml id="r9c5mt"
env:
  - name: PORT
    value: "3001"

  - name: MONGO_URI
    valueFrom:
      secretKeyRef:
        name: user-service-secret
        key: MONGO_URI

  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: user-service-secret
        key: JWT_SECRET

  - name: JWT_EXPIRES_IN
    value: "1d"
```

---

# Service Communication

The User Service is responsible for authentication and user-related operations.

A typical MiniShop request flow is:

```text id="f7k2vz"
Admin Panel / Client
        │
        │ HTTP Request
        ▼
   User Service
      :3001
        │
        ├──────────────► MongoDB
        │
        └──────────────► JWT Authentication
```

If the service is exposed through an API gateway or Kubernetes Ingress, user-related requests can be routed through an endpoint such as:

```text id="b3q8yn"
/api/admin/
```

The exact route depends on the application's Ingress/API gateway configuration.

---

# Security

The following environment variables contain sensitive information:

```text id="m8w4cp"
MONGO_URI
JWT_SECRET
```

Never commit real values for these variables to Git.

The `.gitignore` should contain:

```gitignore id="z2n6fx"
.env
```

For production:

* Store secrets in Kubernetes Secrets.
* Use strong, randomly generated JWT secrets.
* Do not log JWT tokens.
* Do not expose database credentials.
* Use HTTPS for authentication requests.
* Configure appropriate token expiration.
* Apply authentication middleware to protected routes.

---

# Troubleshooting

## MongoDB Connection Error

Verify:

```text id="v5j9qx"
✓ MongoDB is running
✓ MONGO_URI is correct
✓ MongoDB hostname is correct
✓ MongoDB port is accessible
✓ Database credentials are valid
```

When running inside Docker or Kubernetes, avoid using:

```text
localhost
```

Use the appropriate service DNS name instead.

---

## JWT Authentication Error

Verify:

```text id="k4r8mw"
✓ JWT_SECRET is configured
✓ JWT_SECRET is consistent between token generation and verification
✓ JWT_EXPIRES_IN is valid
✓ Authorization header contains a valid token
✓ Token has not expired
```

---

## Port Error

The default User Service port is:

```text id="q7m2vc"
3001
```

Check whether another process is already using the port.

---

# Production Considerations

For production deployments:

* Use Kubernetes Secrets for `JWT_SECRET` and `MONGO_URI`.
* Use a strong randomly generated JWT secret.
* Enable HTTPS.
* Use a managed MongoDB service or highly available MongoDB deployment.
* Configure resource requests and limits.
* Configure liveness and readiness probes.
* Add structured logging.
* Add application monitoring and metrics.
* Apply rate limiting to authentication endpoints.
* Configure appropriate JWT expiration policies.
* Implement proper password hashing and validation.

---

# Summary

The User Service provides authentication and user-management functionality for the MiniShop application.

Its core architecture is:

```text id="t8c4np"
                    Client
                      │
                      ▼
                User Service
                   :3001
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
          MongoDB          JWT Auth
             │
             ▼
        User Management
```

The service can run locally, through Docker/Docker Compose, or as a Kubernetes microservice.

Sensitive configuration such as `MONGO_URI` and `JWT_SECRET` should always be managed securely through environment variables, Docker secrets, Kubernetes Secrets, or the appropriate CI/CD secret-management mechanism.
