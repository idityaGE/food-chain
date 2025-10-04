# 🌾 AgriChain - Blockchain Agricultural Supply Chain

[![SIH 2025](https://img.shields.io/badge/SIH-2025-blue)](https://www.sih.gov.in/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Blockchain](https://img.shields.io/badge/blockchain-Polygon-purple.svg)](https://polygon.technology/)

> **Blockchain-powered agricultural transparency from farm to table**

A decentralized platform that tracks agricultural produce through the entire supply chain, ensuring transparency in pricing, quality, and origin verification.

---

## Demo Video:

https://github.com/user-attachments/assets/63c6c955-7ebf-40a4-9fe4-76985a5f59fe.mp4

## 📋 Problem Statement

**Problem Statement ID:** `25045`

**Problem Statement Title:** Blockchain-Based Supply Chain Transparency for Agricultural Produce

### Description

Create a blockchain-based system to track agricultural produce from farm to consumer, ensuring transparency in pricing, quality, and origin. The solution should allow stakeholders (farmers, distributors, retailers) to verify transactions and reduce exploitation in the supply chain.

### Expected Outcome

A decentralized platform with a user-friendly interface for farmers and consumers to trace produce, reducing fraud and ensuring fair pricing, deployable on low-cost hardware or cloud infrastructure.

### Technical Feasibility

Leverages existing blockchain frameworks like Ethereum or Hyperledger, with smart contracts for automated tracking and QR code integration for consumer access.

**Organization:** Government of Odisha  
**Department:** Electronics & IT Department  
**Category:** Software  
**Theme:** Agriculture, FoodTech & Rural Development

---

## 💡 Our Solution

### Key Features

- **🔗 Blockchain Integration**

  - Smart contracts for automated tracking and verification
  - Deployed on Polygon network for low-cost, fast transactions
  - Immutable records ensuring data integrity

- **👥 Stakeholder Management**

  - On-chain registration for farmers, distributors, retailers, and inspectors
  - Role-based access control and permissions
  - Transparent ownership transfer tracking

- **📦 Batch Tracking System**

  - Each harvest batch recorded with detailed metadata
  - Hash-based verification for authenticity
  - Complete supply chain journey tracking

- **✅ Quality Assurance**

  - Independent inspector verification system
  - AI-powered harvest image validation
  - Quality reports attached to each batch

- **📱 QR Code Integration**

  - Instant access to complete product history
  - Consumer-friendly verification interface
  - Transparent pricing and origin information

- **🤖 AI Validation** _(Coming Soon)_
  - Automated harvest image verification
  - Invoice validation and fraud detection
  - Smart anomaly detection

### Innovation & Uniqueness

- **Hybrid Data Storage:** Essential data on blockchain, detailed information in database for cost optimization
- **Low-Cost Infrastructure:** Runs on Polygon for affordable, scalable deployment
- **AI Integration:** Validates harvest images and invoices automatically
- **Multi-Stakeholder Design:** Benefits farmers, distributors, retailers, consumers, and government
- **QR Code Accessibility:** Simple consumer verification without technical knowledge

---

## 🏗️ Architecture

### System Overview

<img width="1486" height="406" alt="System Architecture Diagram" src="https://github.com/user-attachments/assets/501cd9b7-c8e3-4fb2-9435-85893e4becad" />

### Technical Flow

<img width="2359" height="1291" alt="Technical Implementation Flow" src="https://github.com/user-attachments/assets/83518f92-827a-47c5-b454-bbafba5dc814" />

---

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework for production-grade applications
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn/UI** - Modern component library
- **React Native (Expo)** - Mobile app _(Coming Soon)_

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe backend development
- **JWT** - Authentication & authorization

### Database

- **PostgreSQL** - Relational database
- **Prisma ORM** - Type-safe database client
- **AWS S3** - File storage _(Coming Soon)_

### Blockchain

- **Polygon Network** - Layer 2 scaling solution
- **Solidity** - Smart contract development
- **Ethers.js** - Ethereum interaction library
- **Foundry** - Smart contract development toolkit
- **Anvil** - Local Ethereum node

### DevOps & Tools

- **Bun** - Fast JavaScript runtime (backend)
- **PNPM** - Fast, disk space efficient package manager (frontend)
- **Git** - Version control
- **Docker** - Containerization _(Coming Soon)_

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Bun** (for backend) - [Install Bun](https://bun.sh/)
- **PNPM** (for frontend) - [Install PNPM](https://pnpm.io/installation)
- **PostgreSQL** (v14 or higher)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/idityaGE/sih-project.git
cd sih-project
```

#### 2. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Install dependencies
bun install

# Copy environment variables
cp .env.example .env

# Configure your .env file with:
# - Database connection URL
# - JWT secrets
# - Blockchain RPC URLs
# - Private keys (for development only)
```

#### 3. Setup Database

```bash
# Start local development database
bun run db:dev

# Run database migrations
bunx prisma migrate dev --name init

# Open Prisma Studio (optional - database GUI)
bun run db:studio
```

#### 4. Setup Blockchain

```bash
# Start local Ethereum node (in a new terminal)
anvil

# Deploy smart contracts (in another terminal)
cd ../blockchain
forge build
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

#### 5. Start Backend Server

```bash
cd ../backend
bun run dev
```

The backend server will start on `http://localhost:8080`

#### 6. Setup Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Configure your .env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8080
```

#### 7. Start Frontend Development Server

```bash
pnpm dev
```

The frontend will start on `http://localhost:3000`

---

## 📱 Usage

### For Farmers

1. Register on the platform as a FARMER
2. Create new batch records for harvested produce
3. Add details: product name, quantity, harvest date, pricing
4. Transfer batches to distributors/retailers

### For Distributors/Retailers

1. Register as DISTRIBUTOR or RETAILER
2. Receive batch transfers from farmers
3. Update batch status during transit
4. Transfer to next stakeholder in the chain

### For Quality Inspectors

1. Register as QUALITY_INSPECTOR
2. Access assigned batches for inspection
3. Add quality reports and grades
4. Attach verification certificates

### For Consumers

1. Scan QR code on product
2. View complete supply chain history
3. Verify product authenticity
4. Check quality reports and pricing

---

## 🎯 Roadmap

### Phase 1: Core Platform ✅

- [x] User authentication & authorization
- [x] Batch creation and management
- [x] Blockchain integration
- [x] Basic supply chain tracking

### Phase 2: Enhanced Features (In Progress)

- [ ] QR code generation and scanning
- [ ] Quality inspector workflow
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

### Phase 3: AI Integration (Planned)

- [ ] Harvest image validation
- [ ] Invoice verification
- [ ] Fraud detection system
- [ ] Predictive analytics

### Phase 4: Mobile & Scale (Future)

- [ ] React Native mobile app
- [ ] Offline mode support
- [ ] Cloud deployment
- [ ] Performance optimization


---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 📞 Contact

For any queries or support, please reach out:

- **Email:** adiimaurya02@gmail.com
- **GitHub:** [@idityaGE](https://github.com/idityaGE)
- **Project Link:** [https://github.com/idityaGE/sih-project](https://github.com/idityaGE/sih-project)

---

## 🙏 Acknowledgments

- **Government of Odisha** - For problem statement and support
- **Electronics & IT Department** - For guidance and mentorship
- **SIH 2025** - For providing the platform
- **Polygon** - For blockchain infrastructure
- All open-source contributors

---
