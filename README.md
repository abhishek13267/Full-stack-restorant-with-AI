<<<<<<< HEAD
# Full-stack-restorant-with-AI
=======
# 🍛 Saffron & Sage | Fine Dining Gastronomy

> *"Good food choices are good investments."*

Welcome to the digital home of **Saffron & Sage**, a premium restaurant web project handcrafted with passion by **Abhishek**. This is a fully functional, multi-page fine dining website with live payment integration, an AI chat assistant, admin dashboard, real-time order tracking, and much more.

---

## 🌐 Live Features at a Glance

| Feature | Status |
|---|---|
| PayPal Online Payment Gateway | ✅ Integrated |
| AI Dining Chat Assistant | ✅ Active |
| Admin Dashboard (Menu/Orders) | ✅ Active |
| SQLite Order & User Database | ✅ Active |
| UPI QR Code Payment | ✅ Active |
| Restaurant Menu (Dynamic) | ✅ Active |
| Customer Auth (Signup/Login) | ✅ Active |
| Feedback & Contact Forms | ✅ Active |
| Payment Status Tracker | ✅ Active |
| Chef's Philosophy Modal | ✅ Active |

---

## ✨ Premium Features

### 💳 Online Payment Gateway
- **PayPal Smart Buttons** integrated with the official PayPal JavaScript SDK (Sandbox + Live ready)
- Automatic **Bill Receipt** generated after every successful payment with:
  - Transaction ID
  - Purchase Date & Time
  - Payer Name
  - Amount Paid
- **Download as TXT** or **Print Bill** options on the receipt
- **UPI / QR Code** payment option with manual transaction ID verification
- **Manual Card Payment** form (mock checkout)
- All orders automatically saved to the **SQLite database**

### 🤖 AI Dining Assistant
- A futuristic **Saffron AI Helper** chat widget (bottom-right bubble)
- Responds to questions about the menu, spicy foods, specials, and greetings
- Dark glassmorphism chat UI with animated typing indicators
- Suggestion chips for quick queries

### 🍱 Interactive Menu & Cart
- **Dynamic menu** loaded from the backend SQLite database
- **Shopping cart** with item count badge and remove functionality
- Clicking **"Order Now"** directly opens the payment modal for that item
- Toast notification confirms item added to selection
- **Multi-item cart checkout** calculating the correct total for PayPal

### 👨‍🍳 Chef Abhishek Portrait Section
- Premium photo card with **dark name overlay on the chef's chest area**:
  - Chef Abhishek (bold white)
  - Executive Chef & Founder (saffron gold)
  - ✦ 15+ Years of Excellence ✦ (subtle)
- Unique portrait shape with `border-radius: 40px 100px 40px 40px`
- Grayscale-to-color hover effect

### 📖 Culinary Philosophy Modal
- Opened by clicking **"Explore My Philosophy"** in the Chef section
- Premium **dark luxury theme** (`#1a1a1a` → `#2d0b16` gradient)
- Saffron-gold title with gradient text
- Chef's real portrait as the banner image
- Glassmorphism close button

### 🖼️ Cinematic Visuals & Branding
- Custom-generated branding images: `hero_gen.png`, `sourcing_gen.png`, `craft_gen.png`, `logo_gen.png`
- **Reflective Logo Shine** on hover
- **Infinite Shimmer Welcome** animation on the hero greeting
- Smooth reveal animations on scroll (IntersectionObserver)
- Animated stat counters (Dishes Served, Happy Clients, Chef's Specials, Awards Won)

### 📞 Customer Engagement
- **Contact Page**: Inquiry form with backend persistence
- **Feedback Page**: 5-star rating system with animated submit
- **FAQ Section**: Accordion-style with Burnt Saffron palette
- **Testimonial Slider**: Auto-rotating with dot navigation

### 🔐 Admin Dashboard
- **Secure Manager Login** at `admin.html` (glassmorphism design)
- Manage **Menu Items** (edit names, prices, images)
- View all **Orders** from the database
- View **Customer Contacts** & **Feedback**
- Manage **Registered Users**

### 📦 Payment Status Tracker
- Dedicated `payment-status.html` page
- Enter Order ID from receipt to check real-time status from the database

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm**

### Installation

```bash
# 1. Clone / open the project folder
cd "Restorant web"

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install
cd ..

# 4. Start both frontend (Vite) and backend (Express) together
npm run dev
```

The site will be available at: **http://localhost:5173**
The backend API runs at: **http://localhost:5001**

---

## 🔐 Security & Environment Variables

Sensitive data like passwords and database paths are stored in a `.env` file (never committed to GitHub).

### Setup `.env` in the backend:

```bash
# Copy the example file
copy backend\.env.example backend\.env
```

Then fill in your values in `backend/.env`:

```env
PORT=5001
ADMIN_USERNAME=abhi123
ADMIN_PASSWORD=12345
DB_FILE=./database.sqlite
PAYPAL_CLIENT_ID=sb
PAYPAL_CURRENCY=USD
```

> ⚠️ The `.env` file and `database.sqlite` are **excluded from Git** via `.gitignore` — they will never be uploaded to GitHub.

### What is protected:
| Secret | Where stored |
|---|---|
| Admin Username & Password | `backend/.env` |
| Database file path | `backend/.env` |
| PayPal Client ID | `backend/.env` + `js/main.js` CONFIG |

---

## 💳 PayPal Configuration

To switch from **Sandbox (test)** to **Live (real money)** mode:

1. Open `js/main.js`
2. Find the `CONFIG` object at the top:
```js
const CONFIG = {
    PAYPAL_CLIENT_ID: 'sb',  // ← Replace 'sb' with your real PayPal Client ID
    CURRENCY: 'USD',          // ← Change to 'INR' for Indian Rupees
    API_BASE: 'http://localhost:5001/api'
};
```
3. Also update the PayPal SDK `<script>` tag in `index.html`:
```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=USD"></script>
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, Vanilla CSS3, Vanilla JavaScript (ES Modules) |
| **Build Tool** | Vite 6 |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via `sqlite` & `sqlite3` packages) |
| **Payment** | PayPal JavaScript SDK |
| **Fonts** | Google Fonts (Playfair Display, Montserrat) |
| **Icons** | FontAwesome 6 |

---

## 📁 Project Structure

```
Restorant web/
├── index.html              # Main home page
├── auth.html               # User Signup / Login page
├── admin.html              # Manager Admin Dashboard
├── contact.html            # Customer Contact page
├── feedback.html           # Customer Feedback & Rating page
├── payment-status.html     # Order / Payment Status Tracker
│
├── css/
│   └── style.css           # Full design system, animations, components
│
├── js/
│   ├── main.js             # Core site interactivity & PayPal logic
│   └── data.js             # Menu data fetcher (API connector)
│
├── images/
│   ├── abhi_alone.png      # Chef Abhishek portrait photo
│   ├── hero_gen.png        # Hero section background
│   ├── logo_gen.png        # Restaurant logo
│   ├── sourcing_gen.png    # Sustainability section image
│   ├── craft_gen.png       # Artisanal craft section image
│   ├── img/                # Menu food photography
│   ├── review/             # Customer testimonial avatars
│   └── bg/                 # Page background images
│
├── backend/
│   ├── server.js           # Express API server
│   ├── database.sqlite     # SQLite database file
│   └── package.json        # Backend dependencies
│
├── package.json            # Frontend dependencies & scripts
├── vite.config.js          # Vite build configuration
└── README.md               # This file
```

---

## 🌐 API Endpoints (Backend)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Server health check |
| `GET` | `/api/menu` | Fetch all menu items |
| `PUT` | `/api/menu/:id` | Update a menu item |
| `GET` | `/api/orders` | Fetch all orders |
| `POST` | `/api/orders` | Save a new order |
| `GET` | `/api/orders/:id` | Fetch order by ID |
| `DELETE` | `/api/orders` | Clear all orders |
| `GET` | `/api/feedback` | Fetch all feedback |
| `POST` | `/api/feedback` | Submit feedback |
| `GET` | `/api/contacts` | Fetch all contacts |
| `POST` | `/api/contacts` | Submit contact message |
| `POST` | `/api/users/signup` | Register a new user |
| `POST` | `/api/users/login` | Login a user |
| `POST` | `/api/users/change-password` | Change user password |
| `GET` | `/api/users` | Fetch all users (admin) |

---

## 📱 Responsive Design

The website is fully responsive across all screen sizes:
- 🖥️ Desktop (1200px+)
- 💻 Laptop (991px)
- 📱 Tablet (768px)
- 📲 Mobile (480px and below) — AI chat goes full screen on mobile

---

## 📄 Pages Overview

| Page | URL | Description |
|---|---|---|
| Home | `index.html` | Hero, Menu, Chef, Reviews, FAQ, Payment Modal |
| Sign In | `auth.html` | User Login & Registration |
| Contact | `contact.html` | Customer Inquiry Form |
| Feedback | `feedback.html` | Star Rating & Comment Form |
| Admin | `admin.html` | Manager Dashboard |
| Pay Status | `payment-status.html` | Track Orders by ID |

---

## 🚀 Deployment Guide

This project is designed for modern cloud environments.

### 1. Database: MongoDB Atlas (Cloud)
1.  Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a new Cluster and a Database named `saffron-sage`.
3.  Go to **Database Access** and create a user.
4.  Go to **Network Access** and "Allow Access from Anywhere" (for deployment).
5.  Copy your **Connection String** and use it as `MONGODB_URI` in your `.env`.

### 2. Backend: Render
1.  Push your code to GitHub.
2.  Login to [Render.com](https://render.com) and click **New > Web Service**.
3.  Connect your GitHub repo.
4.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `node server.js`
5.  **Environment Variables**: Add all keys from your `.env` (including `MONGODB_URI` and `JWT_SECRET`).

### 3. Frontend: Vercel
1.  Login to [Vercel](https://vercel.com) and click **Add New Project**.
2.  Select your GitHub repo.
3.  **Settings**:
    *   **Framework Preset**: Other (or Vite if applicable)
    *   **Root Directory**: `./` (Root)
4.  **Environment Variables**:
    *   Change `API_BASE` in `js/main.js` and `js/data.js` to your new Render URL (e.g., `https://your-app.onrender.com/api`).
5.  Deploy!

---

## 👨‍💻 About the Creator

| Detail | Info |
|---|---|
| **Name** | Abhishek |
| **Role** | Full Stack Developer & Executive Chef |
| **Project** | Saffron & Sage — Fine Dining Gastronomy |
| **Contact** | +91 9967253466 |
| **Email** | hello@saffronsage.com |
| **Location** | Mumbai, India |

> This entire project — from UI design to backend API to PayPal payment integration — was **single-handedly designed, developed, and crafted by Abhishek** as a showcase of modern web development skills combined with a passion for fine dining culture.

---

*Handcrafted with ❤️ & Passion by **Abhishek**. Where Every Bite Tells a Story.*
>>>>>>> b86fb6b (first commit)
