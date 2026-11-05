# BookNook Server API

RESTful API backend for **BookNook – A Small Online Library**, built with Express.js, MongoDB, and JWT authentication.

## 🚀 Key Features
- **JWT Protection**: Secure API endpoints with JSON Web Token verification.
- **Full Books CRUD**: Create, Read, Update, and Delete books with role/ownership checks.
- **Smart Borrowing System**: Prevents double-borrowing of the same book simultaneously.
- **Atomic Inventory Updates**: Uses MongoDB `$inc` to track total and available copies in real time.
- **Category & Search Filtering**: Filter books by category, search by title/author/category, and sort by newest.
- **New Arrivals API**: Sorted by newest creation date with configurable limit for home page showcase.

---

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Native MongoDB Driver v6)
- **Security**: JWT (`jsonwebtoken`), CORS, Dotenv

---

## 📋 API Endpoints

### Public Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check & API status |
| `GET` | `/books` | Get all books (Supports `?limit=6`, `?sort=newest`, `?category=...`, `?search=...`, `?email=...`) |
| `GET` | `/books/:id` | Get details for a single book |
| `POST` | `/jwt` | Generate a 7-day JWT access token for authenticated users |

### Protected Endpoints (Requires `Authorization: Bearer <token>`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/books` | Add a new book (saves `createdAt`, `totalCopies`, `availableCopies`, `userEmail`) |
| `PATCH` | `/books/:id` | Update an existing book (owner verification) |
| `DELETE` | `/books/:id` | Delete a book (owner verification) |
| `POST` | `/borrows` | Borrow a book (Checks availability, prevents double borrow, decrements `$inc: -1`) |
| `GET` | `/borrows` | Get all active borrows for the logged-in user |
| `DELETE` | `/borrows/:id` | Return a borrowed book (increments `$inc: +1`) |

---

## ⚙️ Environment Variables
Create a `.env` file in the `server` root directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=booknook_db
JWT_SECRET=your_secret_key
```

---

## 📦 Installation & Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install # or bun install

# Start development server
npm run dev # or bun run dev

# Start production server
npm start
```
