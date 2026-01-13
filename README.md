# BizTrackKos-2

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6.11-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)

**A comprehensive business management solution for Indonesian boarding houses (Kos)**

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Contributing](#contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Schema](#database-schema)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**BizTrackKos-2** is a full-stack web application designed specifically for managing Indonesian boarding houses (Kos). It provides a complete solution for tracking customers, rooms, financial transactions, and business analytics with an intuitive user interface.

### Key Capabilities

- 🏠 **Room Management** - Track occupancy, status, and payments
- 👥 **Customer Management** - Comprehensive tenant tracking with checkout history
- 💰 **Financial Tracking** - Revenue & expense management with categorization
- 📊 **Analytics Dashboard** - Real-time business insights and visualizations
- 📥 **Excel Integration** - Bulk import/export transactions
- 🔐 **Multi-Tenancy** - Secure user-specific data isolation
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

---

## ✨ Features

### Dashboard
- **Real-time Statistics**
  - Total revenue & expenses
  - Net profit calculation
  - Active customers count
  - Occupancy rate percentage
- **Interactive Filtering**
  - All time, monthly, yearly, and custom date ranges
- **Visual Analytics**
  - Income vs expense trend charts
  - Expense category breakdown
- **Recent Activity**
  - Latest transactions list
  - New customer highlights

### Customer Management
- Complete CRUD operations
- Track tenant details:
  - Full name, phone, NIK (Indonesian ID)
  - Entry date, room assignment
  - Payment history
- **Smart Checkout System**
  - Preserves historical records
  - Frees up room for new tenants
  - Calculates accurate occupancy periods
- Active vs checked-out status tracking

### Transaction Management
- **Revenue Tracking**
  - Room payments
  - Other income sources
- **Expense Management**
  - Customizable expense categories
  - Category-based reporting
- **Advanced Features**
  - Excel bulk import (.xlsx)
  - Excel export for reporting
  - Automatic room status updates
  - Customer payment linkage
- **Comprehensive Validation**
  - Room existence checks
  - Customer verification
  - Future date prevention

### Room Management
- Real-time occupancy tracking
- Automatic status updates:
  - "occupied" - Active tenant with recent payment
  - "vacant" - Available for new tenant
- Last payment tracking per room
- Unique room numbering system

### Authentication & Security
- User registration with email validation
- Secure password hashing (bcrypt)
- Session-based authentication (7-day expiry)
- Protected API routes
- Optional API key authentication for webhooks
- Multi-tenant data isolation

---

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 15.3](https://nextjs.org/) (App Router)
- **UI Library**: [React 18.3](https://react.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/) (headless UI)
- **Forms**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) validation
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)

### Backend
- **Runtime**: Node.js 20
- **API**: Next.js API Routes
- **Database ORM**: [Prisma 6.11](https://www.prisma.io/)
- **Database**: PostgreSQL 15
- **Authentication**: bcrypt + cookie-based sessions

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: Gitea Actions
- **Version Control**: Git

---

## 🗄 Database Schema

### Core Models

```prisma
User {
  id           String        @id
  name         String
  email        String        @unique
  password     String        // bcrypt hashed
  customers    Customer[]
  transactions Transaction[]
  rooms        Room[]
  categories   Category[]
}

Customer {
  id           String        @id
  name         String
  phone        String
  nik          String        @unique
  entryDate    DateTime
  roomNumber   String?
  lastPayment  DateTime?
  checkoutDate DateTime?     // NEW: Track checkout history
  Transaction  Transaction[]
}

Transaction {
  id           String        @id
  type         String        // "revenue" | "expense"
  amount       Float
  date         DateTime
  description  String
  category     String?       // For expenses
  roomNumber   String?       // For revenue
  customerName String?
  customerId   String?
}

Room {
  id          String        @id
  roomNumber  String        @unique
  status      String        // "occupied" | "vacant"
  lastPayment DateTime?
}

Category {
  id        String        @id
  name      String
  type      String        // "expense" | "revenue"
  @@unique([name, userId, type])
}
```

**Key Features**:
- Multi-tenant data isolation via `userId`
- Unique constraints on email, NIK, room numbers
- Checkout date preserves customer history
- Room status automatically updates based on payments

---

## 🚀 Installation

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker & Docker Compose (optional)

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/yourusername/biztrackkos-2.git
cd biztrackkos-2

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgres://user:password@localhost:5432/biztrackkos"
POSTGRES_USER="your_user"
POSTGRES_PASSWORD="your_password"
POSTGRES_DB="biztrackkos"

# Application
PORT=9002
NODE_ENV="development"

# Optional: API Key for webhooks
API_KEY="your_secret_api_key"
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

---

## ⚡ Quick Start

### Development Mode

```bash
# Start development server (Turbopack enabled)
npm run dev
```

Visit `http://localhost:9002`

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build and start with Docker Compose
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

---

## 🌐 Deployment

### Automated Deployment (Gitea Actions)

The project includes a CI/CD pipeline that automatically deploys to VPS on push to `master` branch.

**Setup**: See [CICD_SETUP.md](docs/CICD_SETUP.md) for detailed configuration.

### Manual Deployment

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Navigate to project directory
cd /path/to/biztrackkos-2

# Pull latest code
git pull origin master

# Rebuild Docker containers
docker-compose down
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f
```

### Production Checklist

- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Configure `API_KEY` for webhooks
- [ ] Enable HTTPS (reverse proxy with nginx/caddy)
- [ ] Set up database backups
- [ ] Configure environment variables
- [ ] Review security settings

---

## 📚 API Documentation

### Authentication

All API routes require authentication (except login/register):

```bash
# Session-based (automatic with browser cookies)
Cookie: session=<session_token>

# API Key-based (for webhooks)
x-api-key: your_api_key
```

### Endpoints

#### Dashboard
```http
POST /api/dashboard
Content-Type: application/json

{
  "dateFilter": {
    "type": "monthly",
    "month": 0,
    "year": 2024
  }
}
```

#### Transactions
```http
# Create Transaction
POST /api/transactions
Content-Type: application/json

{
  "type": "revenue",
  "amount": 1500000,
  "date": "2024-01-15",
  "description": "Room payment",
  "roomNumber": "101"
}

# Export Transactions (Excel)
GET /api/transactions/export

# Import Transactions (Excel)
POST /api/transactions/import
Content-Type: multipart/form-data
```

#### Customers
```http
# Create Customer
POST /api/customers
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "62812345678",
  "nik": "1234567890123456",
  "entryDate": "2024-01-15",
  "roomNumber": "101"
}

# Checkout Customer
POST /api/customers/checkout
Content-Type: application/json

{
  "id": "customer_id",
  "checkoutDate": "2024-12-31"
}
```

#### Categories
```http
# List Categories
GET /api/categories

# Create Category
POST /api/categories
Content-Type: application/json

{
  "name": "Marketing",
  "type": "expense"
}

# Delete Category
DELETE /api/categories?id=category_id
```

#### Webhook (N8N Integration)
```http
POST /api/n8n
x-api-key: your_api_key
Content-Type: application/json

{
  "type": "revenue",
  "amount": 1500000,
  "date": "2024-01-15",
  "description": "Automated payment",
  "roomNumber": "101"
}
```

### Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## 📁 Project Structure

```
biztrackkos-2/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── dashboard/      # Dashboard API
│   │   │   ├── transactions/   # Transaction CRUD + import/export
│   │   │   ├── customers/      # Customer API
│   │   │   ├── categories/     # Category API
│   │   │   └── n8n/            # Webhook integration
│   │   ├── dashboard.logic.ts  # Dashboard business logic
│   │   ├── customers/          # Customer pages + actions
│   │   ├── transactions/       # Transaction pages + actions
│   │   ├── rooms/              # Room pages
│   │   ├── categories/         # Category actions
│   │   ├── login/              # Authentication
│   │   ├── register/           # Registration
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard page
│   │   └── globals.css         # Global styles
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard components
│   │   ├── customers/          # Customer components
│   │   ├── transactions/       # Transaction components
│   │   ├── rooms/              # Room components
│   │   ├── layout/             # Sidebar, header
│   │   └── ui/                 # Reusable UI components
│   ├── lib/                    # Utilities
│   │   ├── db.ts               # Prisma client
│   │   ├── session.ts          # Session management
│   │   ├── data.ts             # Data fetching
│   │   └── utils.ts            # Helper functions
│   ├── hooks/                  # Custom React hooks
│   ├── types/                  # TypeScript definitions
│   └── middleware.ts           # Next.js middleware (auth)
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
├── migrations/                 # Custom SQL migrations
├── docs/                       # Documentation
│   ├── CICD_SETUP.md
│   ├── ROOM_MANAGEMENT_FEATURES.md
│   └── MIGRATE_PRODUCTION.md
├── .gitea/workflows/           # CI/CD pipelines
│   └── deploy.yml
├── public/                     # Static assets
├── docker-compose.yml          # Container orchestration
├── Dockerfile                  # Container build
└── next.config.ts              # Next.js config
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack

# Building
npm run build            # Production build
npm start                # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking

# Database
npx prisma generate      # Generate Prisma client
npx prisma db push       # Sync schema to DB
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration
```

### Key Business Logic

#### Room Occupancy Calculation
A room is "occupied" if it has a payment recorded within the last 30 days:

```typescript
const oneMonthAgo = subMonths(new Date(), 1);
const occupiedRooms = rooms.filter(
  (room) => room.lastPayment && new Date(room.lastPayment) > oneMonthAgo
);
```

#### Customer Checkout Flow
1. Update customer with `checkoutDate` (preserves history)
2. Find customer's room number
3. Update room status to "vacant"
4. Clear room's `lastPayment` date

#### Transaction Creation
1. Validate input (Zod schema)
2. If revenue with room number:
   - Update room status to "occupied"
   - Update room's `lastPayment`
   - Find and update customer's `lastPayment`
   - Link transaction to customer
3. Create transaction record
4. Revalidate pages for fresh data

### Testing Strategy

Currently, the project uses manual testing. Recommended additions:

```bash
# Unit testing (recommended)
npm install --save-dev jest @testing-library/react

# E2E testing (recommended)
npm install --save-dev playwright
```

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
5. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines

- Follow existing code style (TypeScript, Prettier)
- Write meaningful commit messages
- Test thoroughly before submitting
- Update documentation as needed
- Ensure all tests pass

### Recommended Areas for Contribution

- 🧪 **Testing** - Add unit and E2E tests
- 🔔 **Notifications** - Email/SMS alerts system
- 💳 **Payment Gateway** - Integrate Midtrans/Xendit
- 📱 **Mobile App** - React Native version
- 🌍 **Internationalization** - Multi-language support
- 📊 **Reporting** - PDF export, advanced analytics
- 🔒 **Security** - Rate limiting, audit logging
- 🚀 **Performance** - Query optimization, caching

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Next.js** - React framework
- **Prisma** - Database ORM
- **Radix UI** - Accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Vercel** - Deployment platform (inspiration)

---

## 📞 Support

For questions, issues, or suggestions:

- 📧 Email: support@biztrackkos.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/biztrackkos-2/issues)
- 📖 Documentation: [docs/](docs/) folder

---

## 🔗 Links

- **Live Demo**: Coming soon
- **Documentation**: [docs/](docs/)
- **API Reference**: [API Documentation](#api-documentation)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md) (to be added)

---

<div align="center">

**Built with ❤️ for Indonesian boarding house operators**

[⬆ Back to Top](#biztrackkos-2)

</div>
