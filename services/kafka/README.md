# Kafka Service

This directory contains the configuration required to run **Apache Kafka in KRaft mode** for the MiniShop microservices application.

Kafka is used as the event-streaming/message-broker layer for communication between services, such as publishing product events and consuming them in the notification service.

## Architecture

The Kafka instance runs in **KRaft mode**, meaning it does not require ZooKeeper.

```text
                    MiniShop Services
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
        User Service  Product Service  Notification
                           │            Service
                           │               ▲
                           ▼               │
                       ┌─────────┐         │
                       │  Kafka  │─────────┘
                       │  KRaft  │
                       └─────────┘
```

## Configuration

The `.env.example` file contains the environment variables required to configure Kafka.

### Node Configuration

```env
KAFKA_NODE_ID=1
KAFKA_PROCESS_ROLES=broker,controller
```

Kafka runs as a single node that performs both roles:

* **Broker** — handles message production and consumption.
* **Controller** — manages Kafka cluster metadata using KRaft.

### Listeners

Kafka exposes three listeners:

```env
KAFKA_LISTENERS=INTERNAL://:9092,EXTERNAL://:29092,CONTROLLER://:9093
```

| Listener   |  Port | Purpose                               |
| ---------- | ----: | ------------------------------------- |
| INTERNAL   |  9092 | Communication between Docker services |
| EXTERNAL   | 29092 | Access from the host machine          |
| CONTROLLER |  9093 | KRaft controller communication        |

The advertised listeners are:

```env
KAFKA_ADVERTISED_LISTENERS=INTERNAL://kafka:9092,EXTERNAL://localhost:29092
```

Therefore:

* Docker containers should connect using `kafka:9092`.
* Applications running directly on the host machine can connect using `localhost:29092`.

### Security Protocol

All listeners currently use plaintext communication:

```env
KAFKA_LISTENER_SECURITY_PROTOCOL_MAP=INTERNAL:PLAINTEXT,EXTERNAL:PLAINTEXT,CONTROLLER:PLAINTEXT
```

This configuration is suitable for local development. For production environments, authentication and encryption should be configured.

## KRaft Configuration

Kafka uses the internal listener for broker-to-broker communication:

```env
KAFKA_INTER_BROKER_LISTENER_NAME=INTERNAL
```

The controller listener is:

```env
KAFKA_CONTROLLER_LISTENER_NAMES=CONTROLLER
```

The KRaft controller quorum is configured as:

```env
KAFKA_CONTROLLER_QUORUM_VOTERS=1@kafka:9093
```

This configuration represents a **single-node Kafka cluster**.

## Topic Configuration

The default number of partitions is configured as:

```env
KAFKA_NUM_PARTITIONS=3
```

Therefore, newly created topics will use three partitions by default unless another partition count is explicitly specified.

## Replication Configuration

Because this is a single-node development setup, replication is configured with a factor of `1`:

```env
KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1
KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1
KAFKA_TRANSACTION_STATE_LOG_MIN_ISR=1
```

This configuration should be changed when deploying a multi-node Kafka cluster.

## Consumer Group Configuration

The initial consumer-group rebalance delay is disabled:

```env
KAFKA_GROUP_INITIAL_REBALANCE_DELAY_MS=0
```

This makes local development and testing faster because consumers can join their groups without the default initial delay.

---

# Environment Setup

Create your local environment file from the example:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then update `.env` if any environment-specific configuration is required.

> **Important:** Do not commit `.env` to Git. It may contain environment-specific or sensitive configuration.

---

# Docker Connection

When Kafka is running inside Docker Compose, other containers should connect to:

```text
kafka:9092
```

For example:

```env
KAFKA_BROKER=kafka:9092
```

The hostname `kafka` is resolved through the Docker Compose network.

Applications running outside Docker should use:

```text
localhost:29092
```

For example:

```env
KAFKA_BROKER=localhost:29092
```

---

# Example Service Configuration

A Node.js service using KafkaJS can use:

```env
KAFKA_BROKER=kafka:9092
KAFKA_CLIENT_ID=minishop-service
KAFKA_GROUP_ID=minishop-group
```

The exact configuration depends on whether the service runs inside Docker or directly on the host.

---

# Kafka Topics

MiniShop services can use Kafka topics to exchange asynchronous events.

For example:

```text
Product Service
      │
      │ publish
      ▼
 product-created
      │
      ▼
 Notification Service
      │
      └── process notification
```

A topic can be created using Kafka's command-line tools or programmatically by the application.

Example topic:

```text
product-created
```

---

# Development Notes

This configuration is intended primarily for **local development and testing**.

Current setup:

* Single Kafka node
* KRaft mode
* No ZooKeeper
* One broker
* One controller
* Three default partitions
* Plaintext communication
* Replication factor of `1`

For production, consider:

* Multiple Kafka brokers
* Multiple KRaft controllers
* Replication factor greater than `1`
* TLS encryption
* SASL authentication
* Persistent storage
* Resource limits
* Monitoring and alerting
* Proper topic retention policies

---

# Files

```text
kafka/
├── .env
├── .env.example
├── .gitignore
└── README.md
```

## `.env.example`

Contains the template Kafka configuration required to run the service.

## `.env`

Contains the local environment configuration and should remain untracked.

## `.gitignore`

Prevents environment-specific files such as `.env` from being committed to the repository.

---

# Ports

|    Port | Listener   | Usage                                 |
| ------: | ---------- | ------------------------------------- |
|  `9092` | INTERNAL   | Docker/internal service communication |
| `29092` | EXTERNAL   | Host-to-Kafka communication           |
|  `9093` | CONTROLLER | KRaft controller communication        |

---

# Summary

The MiniShop Kafka service provides the messaging infrastructure required for asynchronous communication between microservices.

The current configuration uses a **single-node Apache Kafka cluster running in KRaft mode**, with separate internal, external, and controller listeners.

```text
Docker Services
      │
      │ kafka:9092
      ▼
┌─────────────────────┐
│   Kafka KRaft Node   │
│                     │
│ Broker    : 9092    │
│ External  : 29092   │
│ Controller: 9093    │
└─────────────────────┘
      │
      ▼
    Topics
      │
      ▼
Consumers / Producers
```
