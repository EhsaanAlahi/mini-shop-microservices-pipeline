# Notification Service

The **Notification Service** is a Node.js microservice responsible for processing notification-related events in the MiniShop application.

It consumes events from **Apache Kafka**, processes notification data, and stores notification records in **MongoDB**. **Cloudinary** is available for cloud-based media/file storage where required by the service.

## Architecture

```text
                    MiniShop Application
                           │
                           │ Product Event
                           ▼
                    ┌──────────────┐
                    │    Kafka     │
                    │ product-     │
                    │ created      │
                    └──────┬───────┘
                           │
                           │ Consume Event
                           ▼
                ┌──────────────────────┐
                │ Notification Service │
                │      Node.js         │
                └───────┬───────┬──────┘
                        │       │
             ┌──────────┘       └──────────┐
             ▼                             ▼
      ┌──────────────┐              ┌──────────────┐
      │   MongoDB    │              │  Cloudinary  │
      │ Notifications│              │ Media Storage│
      └──────────────┘              └──────────────┘
```

---

# Features

The Notification Service provides the following functionality:

* Kafka event consumption
* Asynchronous notification processing
* Notification data persistence
* MongoDB integration
* Cloudinary integration
* REST API endpoints for notification-related operations
* Environment-based configuration
* Docker support

---

# Technology Stack

| Technology   | Purpose                        |
| ------------ | ------------------------------ |
| Node.js      | Application runtime            |
| Express.js   | REST API                       |
| Apache Kafka | Event streaming/message broker |
| KafkaJS      | Kafka client                   |
| MongoDB      | Notification data storage      |
| Cloudinary   | Cloud media/file storage       |
| Docker       | Containerization               |

---

# Project Structure

```text
notification-service/
│
├── controllers/
│   └── ...
│
├── kafka/
│   └── ...
│
├── models/
│   └── ...
│
├── routes/
│   └── ...
│
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

### `controllers/`

Contains the application controllers responsible for handling notification-related business logic.

### `kafka/`

Contains Kafka producer/consumer configuration and event-processing logic.

### `models/`

Contains MongoDB data models.

### `routes/`

Contains Express API routes.

### `index.js`

Application entry point. It initializes the application and required services.

---

# Environment Configuration

Create the local `.env` file from `.env.example`.

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

### Linux/macOS

```bash
cp .env.example .env
```

The `.env.example` file contains:

```env
KAFKA_BROKER=kafka:9092
KAFKA_CLIENT_ID=minishop-service
KAFKA_GROUP_ID=minishop-group

PORT=3003

MONGO_URI=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

# Environment Variables

## Kafka

### `KAFKA_BROKER`

Kafka broker address.

When the Notification Service runs inside the same Docker Compose network as Kafka:

```env
KAFKA_BROKER=kafka:9092
```

When running the service directly on the host machine:

```env
KAFKA_BROKER=localhost:29092
```

### `KAFKA_CLIENT_ID`

Identifies the Notification Service Kafka client.

```env
KAFKA_CLIENT_ID=minishop-service
```

### `KAFKA_GROUP_ID`

Defines the Kafka consumer group.

```env
KAFKA_GROUP_ID=minishop-group
```

Consumer instances using the same group ID can coordinate consumption of Kafka partitions.

---

# Application Port

The service runs on:

```env
PORT=3003
```

Therefore, when running locally:

```text
http://localhost:3003
```

When running inside Kubernetes, the service should be exposed through a Kubernetes `Service`.

---

# MongoDB

The Notification Service uses MongoDB to persist notification-related data.

The MongoDB connection is configured through:

```env
MONGO_URI=
```

Example:

```env
MONGO_URI=mongodb://localhost:27017/minishop
```

For a MongoDB container running inside Docker Compose, the hostname should normally be the Docker service name:

```env
MONGO_URI=mongodb://mongodb:27017/minishop
```

### MongoDB Resources

For MongoDB documentation and deployment information:

[MongoDB Official Website](https://www.mongodb.com/?utm_source=chatgpt.com)

[MongoDB Documentation](https://www.mongodb.com/docs/?utm_source=chatgpt.com)

---

# Cloudinary

Cloudinary provides cloud-based media management and storage.

The service uses the following environment variables:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

These values should be obtained from your Cloudinary account.

Do **not** hard-code Cloudinary credentials inside the source code.

### Cloudinary Resources

[Cloudinary Official Website](https://cloudinary.com/?utm_source=chatgpt.com)

[Cloudinary Documentation](https://cloudinary.com/documentation?utm_source=chatgpt.com)

---

# Local Development

Install dependencies:

```bash
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Configure:

```env
KAFKA_BROKER=localhost:29092
KAFKA_CLIENT_ID=minishop-service
KAFKA_GROUP_ID=minishop-group
PORT=3003

MONGO_URI=mongodb://localhost:27017/minishop

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

Then start the service:

```bash
npm start
```

For development, if a development script is configured in `package.json`:

```bash
npm run dev
```

---

# Docker Configuration

The service includes a `Dockerfile` for containerized deployment.

Build the image:

```bash
docker build -t minishop-notification-service .
```

Run the container:

```bash
docker run -p 3003:3003 --env-file .env minishop-notification-service
```

When using Docker Compose, the service should communicate with Kafka and MongoDB using their Docker service names.

For example:

```env
KAFKA_BROKER=kafka:9092
MONGO_URI=mongodb://mongodb:27017/minishop
```

---

# Kafka Integration

The Notification Service acts primarily as a **Kafka consumer**.

For example, when the Product Service creates a new product:

```text
Product Service
      │
      │ Publish event
      ▼
product-created topic
      │
      ▼
Kafka
      │
      │ Consume event
      ▼
Notification Service
      │
      ├── Process notification
      │
      └── Store notification
             │
             ▼
          MongoDB
```

The Kafka topic used by the application should be created and available before the consumer attempts to process events.

Example:

```text
product-created
```

---

# Kafka Consumer Group

The service uses:

```env
KAFKA_GROUP_ID=minishop-group
```

The consumer group allows Kafka to manage message consumption and partition assignment.

If multiple Notification Service replicas are deployed, Kafka can distribute partitions across the consumer instances belonging to the same consumer group.

---

# Service Communication

When deployed through Docker Compose:

```text
┌───────────────────────┐
│ Notification Service  │
│       :3003           │
└───────────┬───────────┘
            │
      ┌─────┴─────┐
      │           │
      ▼           ▼
   Kafka       MongoDB
 kafka:9092   mongodb:27017
```

When deployed to Kubernetes, use Kubernetes service DNS names instead of `localhost`.

For example:

```env
KAFKA_BROKER=kafka:9092
MONGO_URI=mongodb://mongodb:27017/minishop
```

If Kafka and MongoDB are located in different namespaces, use the appropriate Kubernetes DNS name.

---

# Security

Never commit the `.env` file containing actual credentials.

The following values must be treated as secrets:

```text
MONGO_URI
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET
```

For Kubernetes deployments, these values should preferably be stored using **Kubernetes Secrets** rather than directly inside Deployment manifests or Helm values files.

For CI/CD pipelines, use the CI platform's encrypted secrets mechanism.

---

# Health & Troubleshooting

If the Notification Service cannot connect to Kafka, verify:

```text
✓ Kafka container/pod is running
✓ Kafka service is reachable
✓ KAFKA_BROKER is correct
✓ Kafka topic exists
✓ Consumer group configuration is correct
```

If MongoDB connection fails, verify:

```text
✓ MongoDB is running
✓ MONGO_URI is correct
✓ MongoDB hostname is resolvable
✓ MongoDB port is accessible
```

If Cloudinary operations fail, verify:

```text
✓ CLOUDINARY_CLOUD_NAME is correct
✓ CLOUDINARY_API_KEY is correct
✓ CLOUDINARY_API_SECRET is correct
```

---

# Production Considerations

For production deployment:

* Use Kubernetes Secrets for sensitive environment variables.
* Use a managed MongoDB deployment or properly configured MongoDB cluster.
* Configure Cloudinary credentials securely.
* Use Kafka replication for high availability.
* Configure Kafka topic retention policies.
* Configure resource requests and limits.
* Add liveness and readiness probes.
* Enable structured application logging.
* Add Prometheus metrics where required.
* Configure centralized logging.
* Deploy multiple Notification Service replicas where appropriate.

---

# Summary

The Notification Service acts as the asynchronous notification component of the MiniShop microservices architecture.

Its primary communication flow is:

```text
Product Service
      │
      ▼
   Kafka
      │
      ▼
Notification Service
      │
      ├──────────────► MongoDB
      │
      └──────────────► Cloudinary
```

The service is configured through environment variables and can run locally, through Docker Compose, or as a Kubernetes workload.
