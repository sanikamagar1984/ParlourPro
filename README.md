# ParlourPro

ParlourPro is a professional salon management system developed for a real beauty salon to streamline daily operations, manage customers, staff, services, and track business performance efficiently.

The application replaces manual record-keeping with a secure, digital solution that provides real-time insights into salon operations and revenue.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- Secure login system for Admin and Staff
- JWT-based authentication (stored in cookies)
- Password hashing using bcrypt
- Role-based access control

### 👥 Customer Management
- Add, edit, delete, and search customers
- Store contact details and service history
- Prevent accidental deletion of customers with records

### ✂️ Service Management
- Categorized services (Hair, Skin, Tattoo, Piercing)
- Price and description management
- Export services to CSV, Excel, and PDF

### 🧑‍💼 Staff Management (Admin Only)
- Add and manage staff accounts
- Update employee details and passwords
- Control access permissions

### 🧾 Record & Transaction Management
- Daily service records
- Multiple payment methods (Cash, Card, UPI)
- Date-based filtering and advanced search
- Bulk record deletion (Admin)

### 📊 Dashboard & Analytics
- Daily, weekly, and monthly income tracking
- Total customers, staff, and services overview
- Real-time business performance insights

### 📄 Report Generation
- Export reports in:
  - CSV
  - Excel
  - PDF
- Professionally styled reports for business use

---

## 🛠 Technology Stack

### Frontend
- React.js
- CSS3 (Custom responsive design)
- Axios
- React Icons

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt

---

## 🏗 System Architecture
- RESTful API architecture
- Separate frontend and backend
- Secure cookie-based authentication
- PostgreSQL constraints for data integrity

---

## ▶️ How to Run the Project

### Prerequisites
- Node.js (v16 or above)
- npm
-  npm run dev

- PostgreSQL installed and running

---

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/shavu05/ParlourPro.git
cd ParlourPro
