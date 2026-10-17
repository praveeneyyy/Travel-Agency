# Travel Packages REST API

A production-grade, lightweight RESTful API built with Node.js and Express for managing travel packages, itineraries, pricing, and bookings. It features comprehensive validation, search, multi-field filtering, sorting, pagination, and robust error handling.

---

## Table of Contents

- [Overview](#overview)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Repository Structure](#repository-structure)
- [Data Model & Validation Schema](#data-model--validation-schema)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Development & Execution Commands](#development--execution-commands)
- [Build Commands](#build-commands)
- [API Reference](#api-reference)
  - [Health Check](#health-check)
  - [List Packages (Search, Filter, Sort, Paginate)](#list-packages)
  - [Get Package by ID](#get-package-by-id)
  - [Create Package](#create-package)
  - [Replace Package (Full Update)](#replace-package-full-update)
  - [Partial Update Package](#partial-update-package)
  - [Delete Package](#delete-package)
- [Error Handling](#error-handling)
- [Testing & Verification](#testing--verification)
  - [Importing into Postman](#importing-into-postman)
  - [cURL Examples](#curl-examples)
  - [PowerShell Examples](#powershell-examples)
- [Deployment Process](#deployment-process)
- [Known Limitations & Future Roadmap](#known-limitations--future-roadmap)
- [License](#license)

---

## Overview

The Travel Packages API enables travel agencies, tour operators, and booking platforms to manage tour packages. The service provides endpoints to create, retrieve, filter, sort, update, and remove travel packages while enforcing data integrity, uniqueness, and business validation rules.

### Key Features

- **Full CRUD Support**: Complete support for `POST`, `GET`, `PUT`, `PATCH`, and `DELETE` operations.
- **Dual-Route Support**: Routes are accessible via both `/api/packages` and `/packages` for flexible integration.
- **Advanced Querying**:
  - Full-text search across package names and destinations (`search` / `q`).
  - Categorical filtering (`category` / `enum`).
  - Flight inclusion flag filtering (`includesFlight` / `flag`).
  - Range-based price filtering (`minPrice` / `maxPrice`).
  - Multi-field sorting (`pricePerPerson`, `name`, `destination`, `durationDays`, `category`, `id`) in ascending or descending order.
  - Safe pagination with page limits and bounds checking.
- **Strict Data Validation**: Validates data types, lengths, positive amounts, integer durations, allowed categories, and unique package names (case-insensitive).
- **Graceful Error Handling**: Standardized JSON error responses for malformed payloads (400), unprocessable data (400), non-existent resources (404), and unknown routes (404).

---

## Architecture & Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- **Framework**: [Express.js](https://expressjs.com/) (`v5.3.0`)
- **Module System**: CommonJS (`"type": "commonjs"`)
- **Data Store**: In-memory data store with sequential ID generation (`packages[]` array)
- **API Client Specification**: Postman Collection v2.1 (`Travel_Packages.postman_collection.json`)

```
┌────────────────────────────────────────────────────────┐
│                   Client Application                   │
│          (Postman / cURL / Frontend / Mobile)          │
└───────────────────────────┬────────────────────────────┘
                            │ HTTP Requests
                            ▼
┌────────────────────────────────────────────────────────┐
│                    Express.js App                      │
│                                                        │
│  ├── Middleware (express.json, SyntaxError Handler)    │
│  ├── Request Validation & Uniqueness Checks            │
│  ├── Routing Controllers (/api/packages & /packages)   │
│  └── 404 Route Not Found Handler                       │
└───────────────────────────┬────────────────────────────┘
                            │ In-Memory Operations
                            ▼
┌────────────────────────────────────────────────────────┐
│               In-Memory Data Store                     │
│        (packages[] Array + Auto-Increment ID)          │
└────────────────────────────────────────────────────────┘
```

---

## Repository Structure

```
EXAM/
├── .postman/
│   └── resources.yaml                         # Postman workspace configuration
├── postman/                                   # Local Postman workspace resources
│   ├── collections/
│   └── specs/
├── index.js                                   # Application entry point & API routes
├── package.json                               # Dependencies & scripts
├── package-lock.json                          # Pinned dependency lockfile
├── Travel_Packages.postman_collection.json   # Ready-to-import Postman test collection
└── README.md                                  # Repository documentation
```

---

## Data Model & Validation Schema

Each travel package object adheres to the following schema:

| Property | Type | Required | Constraints & Validation | Description |
|---|---|---|---|---|
| `id` | Integer | System | Read-only, auto-incrementing integer (`1, 2, 3...`). Immutable. | Unique package identifier |
| `name` | String | Yes | Minimum 3 characters (trimmed). Must be globally unique (case-insensitive). | Package display title |
| `destination` | String | Yes | Minimum 2 characters (trimmed). | Travel location / destination |
| `category` | String | Yes | Must be one of the permitted categories: `beach`, `hill`, `heritage`, `adventure`, `pilgrimage` (case-insensitive accepted: lowercase or Title Case). | Travel category classification |
| `pricePerPerson` | Number | Yes | Positive number (`> 0`). Floating-point or integer. | Cost per person |
| `durationDays` | Integer | Yes | Positive integer (`> 0`, `Number.isInteger`). | Tour duration in days |
| `includesFlight` | Boolean | Yes | Boolean (`true` or `false`). | Indicates if airfare is included |

### Permitted Categories
- `beach` / `Beach`
- `hill` / `Hill`
- `heritage` / `Heritage`
- `adventure` / `Adventure`
- `pilgrimage` / `Pilgrimage`

---

## Prerequisites

Before running the application, ensure the following are installed on your system:

- **Node.js**: `v18.0.0` or higher (`v20.x` or `v22.x` LTS recommended). Verify with:
  ```bash
  node -v
  ```
- **npm**: `v9.0.0` or higher. Verify with:
  ```bash
  npm -v
  ```
- **Git** (optional): For cloning the repository.
- **cURL** or **Postman**: For testing API endpoints.

---

## Installation & Setup

1. **Clone or navigate to the project directory**:
   ```bash
   cd c:/Users/Praveen/Downloads/EXAM
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

   This installs `express` (v5.x) as defined in `package.json`.

---

## Environment Configuration

The application uses sensible defaults and can be configured using environment variables:

| Variable | Type | Default | Description |
|---|---|---|---|
| `PORT` | Integer | `8080` | Port number on which the HTTP server listens |

### Setting Environment Variables

- **Linux / macOS**:
  ```bash
  export PORT=3000
  npm start
  ```

- **Windows (Command Prompt)**:
  ```cmd
  set PORT=3000
  npm start
  ```

- **Windows (PowerShell)**:
  ```powershell
  $env:PORT="3000"
  npm start
  ```

---

## Development & Execution Commands

### Starting the Server

To start the API server:

```bash
npm start
```

Alternatively, run directly with Node:

```bash
node index.js
```

### Expected Output

```
Server started and listening on port 8080
```

The server is now active and listening at `http://localhost:8080`.

---

## Build Commands

This application is written in standard CommonJS Node.js and executes natively on the V8 engine without requiring an intermediate compilation or transpilation build step (such as Babel, TypeScript, or Webpack).

To validate syntax across the codebase without starting the server, run:

```bash
node --check index.js
```

---

## API Reference

The API supports both `/api/packages` and `/packages` route prefixes. Examples below use `/api/packages`.

### Health Check

Verify if the service is online.

- **Method**: `GET`
- **Path**: `/`
- **Response**: `200 OK`
  ```
  API is running
  ```

---

### List Packages

Retrieve a paginated, searchable, filterable, and sortable list of travel packages.

- **Method**: `GET`
- **Path**: `/api/packages`
- **Query Parameters**:
  | Parameter | Type | Default | Description |
  |---|---|---|---|
  | `page` | Integer | `1` | Page number (must be integer $\ge 1$) |
  | `limit` | Integer | `10` | Page size (integer between `1` and `50`) |
  | `search` or `q` | String | - | Case-insensitive substring match against `name` or `destination` |
  | `category` or `enum` | String | - | Filter by category (e.g. `Beach`, `hill`, `adventure`) |
  | `includesFlight` or `flag` | String | - | Filter by flight inclusion (`true` or `false`) |
  | `minPricePerPerson` / `minPrice` / `minAmount` / `min` | Number | - | Minimum price per person ($\ge 0$) |
  | `maxPricePerPerson` / `maxPrice` / `maxAmount` / `max` | Number | - | Maximum price per person ($\ge 0$, must be $\ge$ min) |
  | `sort` or `sortBy` | String | `id` | Sort field: `pricePerPerson`, `amount`, `price`, `name`, `text1`, `destination`, `text2`, `durationDays`, `count`, `category`, `enum`, `id` |
  | `order` | String | `asc` | Sort direction: `asc`, `ascending`, `desc`, `descending` |

- **Success Response (`200 OK`)**:
  ```json
  {
    "data": [
      {
        "id": 1,
        "name": "Goa Beach Gateway",
        "destination": "Goa",
        "category": "Beach",
        "pricePerPerson": 18500,
        "durationDays": 4,
        "includesFlight": false
      }
    ],
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
  ```

---

### Get Package by ID

Fetch details of a single package by its ID.

- **Method**: `GET`
- **Path**: `/api/packages/:id`
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "name": "Goa Beach Gateway",
    "destination": "Goa",
    "category": "Beach",
    "pricePerPerson": 18500,
    "durationDays": 4,
    "includesFlight": false
  }
  ```
- **Error Response (`404 Not Found`)**:
  ```json
  {
    "error": "Package not found"
  }
  ```

---

### Create Package

Create a new travel package. All fields are mandatory.

- **Method**: `POST`
- **Path**: `/api/packages`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Goa Beach Gateway",
    "destination": "Goa",
    "category": "Beach",
    "pricePerPerson": 18500,
    "durationDays": 4,
    "includesFlight": false
  }
  ```
- **Success Response (`201 Created`)**:
  ```json
  {
    "id": 1,
    "name": "Goa Beach Gateway",
    "destination": "Goa",
    "category": "Beach",
    "pricePerPerson": 18500,
    "durationDays": 4,
    "includesFlight": false
  }
  ```
- **Error Responses (`400 Bad Request`)**:
  - Missing field: `{"error": "name is required"}`
  - Short name: `{"error": "name must be at least 3 characters long"}`
  - Duplicate name: `{"error": "Package with this name already exists"}`
  - Invalid category: `{"error": "Invalid category"}`
  - Invalid price: `{"error": "pricePerPerson must be a positive number"}`
  - Invalid duration: `{"error": "durationDays must be a positive integer"}`
  - Invalid flight flag: `{"error": "includesFlight must be a boolean"}`

---

### Replace Package (Full Update)

Completely replaces an existing package. All fields must be supplied and validated. The `id` property remains immutable.

- **Method**: `PUT`
- **Path**: `/api/packages/:id`
- **Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "name": "Goa Luxury Retreat",
    "destination": "Goa",
    "category": "Beach",
    "pricePerPerson": 25000,
    "durationDays": 5,
    "includesFlight": true
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "name": "Goa Luxury Retreat",
    "destination": "Goa",
    "category": "Beach",
    "pricePerPerson": 25000,
    "durationDays": 5,
    "includesFlight": true
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{"error": "Package not found"}`
  - `400 Bad Request`: Validation failure or duplicate name conflict with another package.

---

### Partial Update Package

Updates one or more fields of an existing package. Omitted fields retain their existing values.

- **Method**: `PATCH`
- **Path**: `/api/packages/:id`
- **Headers**: `Content-Type: application/json`
- **Request Body** (example updating only price and duration):
  ```json
  {
    "pricePerPerson": 22000,
    "durationDays": 6
  }
  ```
- **Success Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "name": "Goa Beach Gateway",
    "destination": "Goa",
    "category": "Beach",
    "pricePerPerson": 22000,
    "durationDays": 6,
    "includesFlight": false
  }
  ```
- **Error Responses**:
  - `404 Not Found`: `{"error": "Package not found"}`
  - `400 Bad Request`: No recognized fields provided (`{"error": "At least one valid field is required for update"}`) or validation failure on provided fields.

---

### Delete Package

Removes a package by its ID.

- **Method**: `DELETE`
- **Path**: `/api/packages/:id`
- **Success Response (`204 No Content`)**:
  - No response body.
- **Error Response (`404 Not Found`)**:
  ```json
  {
    "error": "Package not found"
  }
  ```

---

## Error Handling

The application provides consistent JSON error responses across all failure scenarios:

| Status Code | Scenario | Sample Response |
|---|---|---|
| `400 Bad Request` | Malformed JSON in request body | `{"error": "Malformed JSON payload"}` |
| `400 Bad Request` | Missing or invalid field validation | `{"error": "pricePerPerson must be a positive number"}` |
| `400 Bad Request` | Duplicate package name | `{"error": "Package with this name already exists"}` |
| `400 Bad Request` | Invalid query parameters (e.g. `page=0` or `min > max`) | `{"error": "Page must be a positive integer"}` |
| `404 Not Found` | Package with requested ID does not exist | `{"error": "Package not found"}` |
| `404 Not Found` | Unrecognized route or endpoint | `{"error": "Route not found"}` |

---

## Testing & Verification

### Importing into Postman

A pre-configured Postman Collection is provided in the repository root:
`Travel_Packages.postman_collection.json`

1. Open Postman.
2. Click **Import** in the upper-left corner.
3. Drag and drop or browse to select `Travel_Packages.postman_collection.json`.
4. The imported collection contains ready-to-execute requests:
   - `1. Create Package (POST)`
   - `2. Get All Packages (GET)`
   - `3. Get Package by ID (GET)`
   - `4. Replace Package (PUT)`
   - `5. Partial Update (PATCH)`
   - `6. Delete Package (DELETE)`

---

### cURL Examples

#### 1. Check Health
```bash
curl -X GET http://localhost:8080/
```

#### 2. Create a Package
```bash
curl -X POST http://localhost:8080/api/packages \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Manali Snow Adventure",
    "destination": "Manali",
    "category": "Hill",
    "pricePerPerson": 14000,
    "durationDays": 5,
    "includesFlight": false
  }'
```

#### 3. List Packages with Pagination and Sorting
```bash
curl -X GET "http://localhost:8080/api/packages?page=1&limit=5&sort=pricePerPerson&order=desc"
```

#### 4. Filter by Category and Flight Inclusion
```bash
curl -X GET "http://localhost:8080/api/packages?category=Hill&includesFlight=false"
```

#### 5. Search by Name or Destination
```bash
curl -X GET "http://localhost:8080/api/packages?search=Manali"
```

#### 6. Get Package by ID
```bash
curl -X GET http://localhost:8080/api/packages/1
```

#### 7. Update Package (PATCH)
```bash
curl -X PATCH http://localhost:8080/api/packages/1 \
  -H "Content-Type: application/json" \
  -d '{"pricePerPerson": 15500}'
```

#### 8. Delete Package
```bash
curl -X DELETE http://localhost:8080/api/packages/1
```

---

### PowerShell Examples (Windows)

For developers on Windows using PowerShell:

```powershell
# 1. Create a Package
$body = @{
    name = "Kerala Backwaters Serenity"
    destination = "Alleppey"
    category = "Beach"
    pricePerPerson = 21000
    durationDays = 4
    includesFlight = $true
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:8080/api/packages" -Method POST -Headers @{"Content-Type"="application/json"} -Body $body
$response | Format-List

# 2. Get All Packages
$packages = Invoke-RestMethod -Uri "http://localhost:8080/api/packages" -Method GET
$packages.data | Format-Table id, name, destination, category, pricePerPerson, durationDays, includesFlight

# 3. Partially Update Package 1
$patchBody = @{ pricePerPerson = 19500 } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8080/api/packages/1" -Method PATCH -Headers @{"Content-Type"="application/json"} -Body $patchBody

# 4. Delete Package 1
Invoke-RestMethod -Uri "http://localhost:8080/api/packages/1" -Method DELETE
```

---

## Deployment Process

### 1. Process Manager (PM2 / Systemd)

For running as a persistent daemon in production environments on Linux, macOS, or Windows servers:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start index.js --name "travel-packages-api"

# Monitor application status & logs
pm2 status
pm2 logs travel-packages-api
```

### 2. Containerized Deployment (Docker)

To run the API inside a Docker container:

Create a `Dockerfile`:
```dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
ENV PORT=8080
USER node
CMD ["node", "index.js"]
```

Build and run the container:
```bash
docker build -t travel-packages-api:latest .
docker run -d -p 8080:8080 --name travel-api travel-packages-api:latest
```

### 3. Cloud Platforms (Render, Railway, Fly.io, Cloud Run)

- **Root Directory**: `.`
- **Build Command**: `npm install` (or leave empty)
- **Start Command**: `npm start`
- **Environment Variable**: Configure `PORT` if required by the cloud host (defaults to `8080`).

---

## Known Limitations & Future Roadmap

- **In-Memory Storage**: Current data is held in process memory (`packages[]` array). Restarting the Node server resets the collection to empty.
  - *Roadmap*: Add database persistence using PostgreSQL/MongoDB or SQLite with an ORM/query builder (e.g. Prisma or Sequelize).
- **Authentication & Authorization**: The API is currently open and does not enforce API tokens or user roles.
  - *Roadmap*: Add JWT authentication and role-based access control (Admin vs Customer).
- **Rate Limiting**: No request rate limiting is currently applied.
  - *Roadmap*: Integrate `express-rate-limit` to protect public endpoints from abuse.
- **Automated Tests**: Current testing relies on Postman and manual scripts.
  - *Roadmap*: Implement unit and integration tests using Jest/Supertest.

---

## License

This project is licensed under the [ISC License](LICENSE).
