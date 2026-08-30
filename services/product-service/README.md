# Product Service

The **Product Service** is a Node.js microservice responsible for managing products in the MiniShop application.

It provides REST APIs for product management, stores product data in **MongoDB**, and uses **Cloudinary** for cloud-based media/file management.

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
                  │  Product Service  │
                  │      :3002        │
                  └────────┬──────────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
            ┌──────────┐      ┌────────────┐
            │ MongoDB  │      │ Cloudinary │
            │ Products │      │   Media    │
            └──────────┘      └────────────┘
```

The Product Service can also publish application events to Kafka when integrated with the MiniShop event-driven architecture.

---

# Features

The Product Service provides functionality for:

* Product creation
* Product retrieval
* Product updating
* Product deletion
* Product data persistence
* MongoDB integration
* Cloudinary media management
* REST API endpoints
* Authentication/authorization middleware where configured
* Docker containerization
* Environment-based configuration

---

# Technology Stack

| Technology | Purpose             |
| ---------- | ------------------- |
| Node.js    | Application runtime |
| Express.js | REST API framework  |
| MongoDB    | Product database    |
| Cloudinary | Cloud media storage |
| Docker     | Containerization    |

---

# Project Structure

```text
product-service/
│
├── config/
│   └── ...
│
├── controller/
│   └── ...
│
├── middleware/
│   └── ...
│
├── model/
│   └── ...
│
├── routes/
│   └── ...
│
├── utils/
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

Contains application configuration and external service configuration.

### `controller/`

Contains the business logic for handling product-related HTTP requests.

### `middleware/`

Contains Express middleware such as authentication, authorization, validation, or error handling.

### `model/`

Contains MongoDB/Mongoose models used by the Product Service.

### `routes/`

Contains REST API route definitions.

### `utils/`

Contains reusable utility/helper functions.

### `index.js`

The main entry point of the Product Service.

---

# Environment Configuration

The service uses environment variables for runtime configuration.

The `.env.example` file contains:

```env id="5n5v8k"
PORT=3002

MONGO_URI=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Create a local `.env` file from the example.

### Windows PowerShell

```powershell id="4k7g2s"
Copy-Item .env.example .env
```

### Linux/macOS

```bash id="e6b7z9"
cp .env.example .env
```

Then configure the required values.

---

# Environment Variables

## PORT

Defines the HTTP port used by the Product Service.

```env id="j3u9q0"
PORT=3002
```

The service will be available locally at:

```text id="u5r3ez"
http://localhost:3002
```

---

# MongoDB

The Product Service uses MongoDB to store product information.

Configure the MongoDB connection using:

```env id="9i3l4p"
MONGO_URI=
```

For a locally running MongoDB instance:

```env id="z9s8gk"
MONGO_URI=mongodb://localhost:27017/minishop
```

If MongoDB is running as a Docker Compose service named `mongodb`:

```env id="2j5k8m"
MONGO_URI=mongodb://mongodb:27017/minishop
```

### MongoDB Resources

[MongoDB Official Website](https://www.mongodb.com/?utm_source=chatgpt.com)

[MongoDB Documentation](https://www.mongodb.com/docs/?utm_source=chatgpt.com)

---

# Cloudinary

Cloudinary is used for cloud-based media management, such as product images.

Configure Cloudinary using:

```env id="8q2v5n"
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

These credentials should be obtained from your Cloudinary account.

### Cloudinary Resources

[Cloudinary Official Website](https://cloudinary.com/?utm_source=chatgpt.com)

[Cloudinary Documentation](https://cloudinary.com/documentation?utm_source=chatgpt.com)

> **Security:** Never hard-code Cloudinary credentials in the application source code or commit them to Git.

---

# Local Development

Install dependencies:

```bash id="f0k2wd"
npm install
```

Create the environment file:

```bash id="8r1m3c"
cp .env.example .env
```

Configure the environment:

```env id="g4n7vx"
PORT=3002

MONGO_URI=mongodb://localhost:27017/minishop

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

Start the service:

```bash id="q6t2mb"
npm start
```

If a development script is configured in `package.json`:

```bash id="v5x9ka"
npm run dev
```

---

# Docker

The Product Service contains a `Dockerfile` for containerized deployment.

## Build Image

From the Product Service directory:

```bash id="r8j3nc"
docker build -t minishop-product-service .
```

## Run Container

```bash id="k7p4zs"
docker run -p 3002:3002 --env-file .env minishop-product-service
```

The service will then be accessible at:

```text id="w2f6qh"
http://localhost:3002
```

---

# Docker Compose

When running the complete MiniShop application through Docker Compose, the Product Service should communicate with MongoDB using the MongoDB service name rather than `localhost`.

Example:

```env id="x3d7mv"
MONGO_URI=mongodb://mongodb:27017/minishop
```

The basic communication flow is:

```text id="p8h2jw"
Product Service
      │
      │ MongoDB connection
      ▼
mongodb:27017
```

---

# Kubernetes

The Product Service can be deployed to Kubernetes as a containerized microservice.

A typical Kubernetes architecture is:

```text id="c6n9rt"
                  Ingress
                     │
                     ▼
             Product Service
                  :3002
                     │
                     ▼
                 MongoDB
```

The Kubernetes `Service` should expose port `3002` and forward traffic to the application container port.

Environment variables such as `MONGO_URI` and Cloudinary credentials should preferably be provided through **Kubernetes Secrets**.

Example configuration concept:

```yaml id="m4q7fs"
env:
  - name: PORT
    value: "3002"

  - name: MONGO_URI
    valueFrom:
      secretKeyRef:
        name: product-service-secret
        key: MONGO_URI
```

---

# Service Communication

The Product Service is responsible for product-related operations.

A typical MiniShop request flow is:

```text id="h2v5bc"
Admin Panel
    │
    │ HTTP Request
    ▼
Product Service
    │
    ├──────────────► MongoDB
    │
    └──────────────► Cloudinary
```

For example, when an administrator creates a product:

```text id="z4c8qp"
Admin Panel
     │
     │ Create Product
     ▼
Product Service
     │
     ├── Upload product image
     │       │
     │       ▼
     │   Cloudinary
     │
     └── Save product information
             │
             ▼
          MongoDB
```

---

# Kafka Integration

If the Product Service is integrated with the MiniShop Kafka architecture, product-related events can be published after successful operations.

For example:

```text id="v7k3xa"
Product Service
      │
      │ Product Created
      ▼
    Kafka
      │
      ▼
product-created
      │
      ▼
Notification Service
```

This allows other microservices to react to product events asynchronously without tightly coupling them to the Product Service.

---

# Security

The following environment variables contain sensitive information:

```text id="s2f9jd"
MONGO_URI
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

Do not commit these values to Git.

The `.env` file should remain ignored by Git:

```gitignore id="q1w8er"
.env
```

For Kubernetes deployments, use Kubernetes Secrets.

For CI/CD, use encrypted repository or organization secrets.

---

# Troubleshooting

## MongoDB Connection Error

Check:

```text id="e7m2pk"
✓ MongoDB is running
✓ MONGO_URI is correct
✓ MongoDB hostname is correct
✓ MongoDB port is accessible
✓ Database credentials are valid
```

When running inside Docker, do not normally use:

```text id="x5r1na"
localhost
```

Use the MongoDB Docker service name instead:

```text id="d9k3hs"
mongodb:27017
```

---

## Cloudinary Error

Check:

```text id="a6v4yc"
✓ CLOUDINARY_CLOUD_NAME is correct
✓ CLOUDINARY_API_KEY is correct
✓ CLOUDINARY_API_SECRET is correct
✓ Cloudinary account is accessible
```

---

## Port Error

The default Product Service port is:

```text id="u2p7mz"
3002
```

Check whether another process is already using this port.

---

# Production Considerations

For production deployments:

* Use Kubernetes Secrets for credentials.
* Use a managed MongoDB deployment where appropriate.
* Configure Cloudinary credentials securely.
* Configure readiness and liveness probes.
* Set CPU and memory requests/limits.
* Configure centralized logging.
* Configure monitoring and metrics.
* Use HTTPS through the ingress layer.
* Apply authentication and authorization middleware.
* Configure appropriate MongoDB indexes.
* Configure backup and recovery for persistent data.

---

# Summary

The Product Service is the product-management microservice in the MiniShop architecture.

Its primary responsibilities are:

```text id="r3k8vf"
                    Product Service
                         :3002
                           │
             ┌─────────────┴─────────────┐
             │                           │
             ▼                           ▼
          MongoDB                   Cloudinary
      Product Storage              Media Storage
             │
             │
             ▼
        Kafka Events
             │
             ▼
   Notification Service
```

The service can run locally, inside Docker/Docker Compose, or as a Kubernetes workload.
