# Contify CMS

Contify CMS is a role-based content management workflow platform available in **two different implementations**:

1. **React + Spring Boot** - Modern SPA with JWT authentication
2. **PHP 8.3 MVC** - Server-side rendered application with session-based auth

Both implementations share the same database schema and workflow logic but use different technology stacks.

## 📁 Project Structure

```
CMS_Project/
├── client/          # React 19 + Vite frontend (port 5173)
├── server/          # Spring Boot 4 backend (port 9090)
├── php_project/     # PHP 8.3 full-stack MVC (port 8000)
└── README.md        # This file
```

## 📚 Documentation Structure

This file is the single source of truth for project-level setup and architecture.

Module-specific docs:
- `client/README.md` - React frontend run/build shortcuts
- `server/README.md` - Spring Boot backend run/build shortcuts
- `server/API_DOCUMENTATION.md` - REST API endpoint reference
- `php_project/README.md` - **PHP application setup, running instructions, and complete feature guide**

## 🏗️ Architecture Overview

### **Setup 1: React + Spring Boot (Modern SPA)**

```
┌─────────────────────────┐
│   React Frontend        │
│   Port: 5173            │
│   (Vite Dev Server)     │
└────────────┬────────────┘
             │ (API calls via /api/*)
             ↓
┌─────────────────────────┐
│   Spring Boot API       │
│   Port: 9090            │
│   (REST Endpoints)      │
└────────────┬────────────┘
             │ (SQL queries)
             ↓
┌─────────────────────────┐
│  MySQL Database         │
│  (Database: Contify)    │
└─────────────────────────┘
```

**Characteristics:**
- Frontend and backend are **separate applications**
- Communication via **REST API**
- Authentication via **JWT tokens**
- Database: **`Contify`**
- Best for: Modern development, mobile app support, microservices

---

### **Setup 2: PHP MVC Full-Stack (Server-Side Rendered)**

```
┌──────────────────────────────┐
│   PHP Application            │
│   Port: 8000                 │
│                              │
│  ├─ Router                   │
│  ├─ Controllers              │
│  ├─ Views (SSR HTML)         │
│  └─ Database Layer           │
└────────────┬─────────────────┘
             │ (Direct DB queries)
             ↓
┌──────────────────────────────┐
│  MySQL Database              │
│  (Database: contify_php)     │
└──────────────────────────────┘
```

**Characteristics:**
- Frontend and backend are **single application**
- **Server-Side Rendering (SSR)** - HTML generated on server
- No separate API layer
- Authentication via **session cookies**
- Database: **`contify_php`**
- Best for: Traditional web apps, simpler deployment, lower resource usage

---

## 🚀 Quick Start

### **Option 1: Run React + Spring Setup**

**Requirements:**
- Java 17+
- Node.js + npm
- MySQL with `Contify` database

**Terminal 1 - Start Spring Backend:**
```bash
cd server
mvnw spring-boot:run
# Backend runs on http://localhost:9090/api
```

**Terminal 2 - Start React Frontend:**
```bash
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
# Open browser to http://localhost:5173
```

---

### **Option 2: Run PHP Application**

**Requirements:**
- PHP 8.3+
- MySQL with `contify_php` database
- Migrations run (see `php_project/README.md`)

**Terminal 1 - Start PHP Server:**
```bash
cd php_project
php -S localhost:8000 -t public
# Application runs on http://localhost:8000
# Open browser to http://localhost:8000
```

**Detailed setup guide:** See `php_project/README.md`

---

## 📊 Feature Comparison

| Feature | React + Spring | PHP |
|---------|---|---|
| **Technology** | React 19 + Spring Boot | PHP 8.3 MVC |
| **Rendering** | Client-side (SPA) | Server-side (SSR) |
| **Frontend** | Separate (port 5173) | Integrated (port 8000) |
| **Backend** | Separate (port 9090) | Integrated (port 8000) |
| **Authentication** | JWT tokens | Session cookies |
| **Database** | `Contify` | `contify_php` |
| **API** | REST JSON endpoints | Form-based + SSR |
| **Port** | 5173 + 9090 | 8000 |

---

## ✨ Main Features

Implemented across both implementations:

### Authentication and User Roles
- Role-based login and signup (Admin, Editor, Stakeholder)
- User records persisted in MySQL
- Secure password storage (hashed)
- Role-specific dashboards

### Stakeholder Features
- Create project requests
- View own project requests
- Review admin proposals
- Accept/reject proposals or request changes
- View and sign off task deliverables
- Rate and provide feedback on completed projects

### Admin Features
- View incoming project requests
- Create and send proposals to stakeholders
- Create and assign tasks to editors
- Review editor submissions
- Approve work or request revisions
- Dashboard with analytics
- Audit logs and settings management
- Financial tracking and user management

### Editor Features
- View assigned tasks and deadlines
- Submit work deliverables
- Track task status and revision requests
- Profile management
- Financial details and notifications

### System Features
- Real-time notifications
- Project/task workflow state management
- Messaging system with participant tracking
- Media dashboard with cloud viewer, video player, task streams
- Content versioning and history tracking
- Role-specific UI customization

---

## 🔄 Core Workflow

Both implementations support the same workflow:

1. **Stakeholder** submits a project request
2. **Admin** reviews request and creates a proposal with timeline
3. **Stakeholder** accepts proposal or requests changes
4. **Admin** creates tasks and assigns them to editors
5. **Editors** submit work deliverables
6. **Admin** reviews submissions and approves or requests revision
7. **Stakeholder** signs off final delivery and provides feedback

---

## 📦 Repository Structure

```
CMS_Project/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/             # React components by feature
│   │   ├── pages/                  # Page components
│   │   ├── services/               # API services
│   │   ├── context/                # React context (auth, etc.)
│   │   ├── routes/                 # Route definitions
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── README.md                   # Frontend quick start
│
├── server/                          # Spring Boot Backend
│   ├── src/main/java/com/example/
│   │   ├── controller/             # REST endpoints
│   │   ├── entity/                 # JPA entities
│   │   ├── repository/             # Database access
│   │   ├── service/                # Business logic
│   │   ├── security/               # JWT & Auth
│   │   └── ServerApplication.java
│   ├── src/main/resources/
│   │   └── application.properties  # Configuration
│   ├── pom.xml                     # Maven dependencies
│   ├── README.md                   # Backend quick start
│   └── API_DOCUMENTATION.md        # API endpoints
│
├── php_project/                    # PHP Full-Stack MVC
│   ├── public/
│   │   └── index.php              # Router entry point
│   ├── src/
│   │   ├── Controllers/           # Page controllers
│   │   ├── Core/                  # Application core (Router, DB, Session)
│   │   ├── Repositories/          # Database access layer
│   │   └── Middleware/            # Request middleware
│   ├── views/                     # Server-side rendered templates
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── editor/
│   │   ├── messages/
│   │   ├── media/
│   │   ├── profile/
│   │   ├── projects/
│   │   └── layouts/
│   ├── config/                    # Application configuration
│   ├── migrations/                # SQL schema migrations
│   ├── README.md                  # PHP setup & running guide
│   └── HELP.md                    # PHP troubleshooting
│
└── README.md                       # This file
```

---

## 🔧 Environment Setup

### React + Spring Setup

Create `.env` file in `server/` directory:
```env
DB_URL=jdbc:mysql://localhost:3306/Contify?useSSL=false&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=root
JWT_SECRET=your-secret-key-change-in-production
```

Backend expects React frontend at `http://localhost:5173` (CORS configured).

### PHP Setup

Create `.env` file in `php_project/` directory:
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=contify_php
DB_USER=root
DB_PASS=
```

Then run MySQL migrations (see `php_project/README.md`).

---

## 📝 Current Release Status

✅ **React + Spring**: Client build verified, API documentation available in `server/API_DOCUMENTATION.md`  
✅ **PHP**: SSR implementation with session auth, role-based routing, and project-ownership checks on stakeholder actions  
✅ **Shared docs**: Root README now points to the release diagram and LinkedIn caption assets below

**Validation note**: The React client and PHP controllers were re-checked during this cleanup pass.

---

## 🤝 Contributing

When adding features:
1. Implement in React + Spring first (primary)
2. Port to PHP as SSR equivalent if needed
3. Keep database schemas in sync
4. Update both `client/README.md` and `php_project/README.md` if adding routes

---

## 📞 Support

- **React/Spring questions**: See `server/API_DOCUMENTATION.md`
- **PHP questions**: See `php_project/README.md` and `php_project/HELP.md`
- **Database issues**: Check migration files in `php_project/migrations/`

## 📦 Release Assets

- Architecture diagram: `docs/architecture.mmd`
- LinkedIn caption draft: `docs/linkedin-caption.md`

## Repository Hygiene

- Keep real secrets only in local `.env` files.
- Keep `.env.example` files template-only.
- Keep local credential notes in ignored files (for example, `Credentials.txt`).
- Do not commit generated debug snapshots or local upload artifacts.

## Local Setup

## Prerequisites
- Node.js 18+
- Java 21+
- Maven (or use mvnw wrapper in server)
- MySQL 8+

## 1) Clone and install

```bash
git clone <your-repo-url>
cd CMS_Project
```

### Frontend

```bash
cd client
npm install
npm run dev
```

Frontend runs on http://localhost:5173

### Backend

```bash
cd server
mvnw spring-boot:run
```

Backend runs on http://localhost:9090

## Environment Files Policy

- Use local `.env` files for real credentials.
- Keep `.env.example` files template-only (no live secrets).
- Never commit real secrets to git.

## 2) Database configuration

Update backend config in server/src/main/resources/application.properties:

- spring.datasource.url
- spring.datasource.username
- spring.datasource.password
- app.jwt.secret (set a secure secret in production)

Default database name expected by current config: Contify

Hibernate is set to update schema automatically.

## API Base

Frontend expects backend API at:

- http://localhost:9090/api

## Key Route Overview (Frontend)

### Public
- /
- /login
- /signup/:roleName
- /roles

### Admin
- /admin/dashboard
- /admin/projects
- /admin/projects/:id

### Editor
- /editor/dashboard
- /projects
- /projects/:id/content

### Stakeholder
- /stakeholder/home
- /stakeholder/create-project-request
- /stakeholder/projects/:id

## Security Notes

- Passwords are stored as hashed values (BCrypt) in MySQL.
- JWT is used for stateless authentication after login.
- Do not commit production secrets or credentials to GitHub.

## In Development / Upcoming Features

Planned enhancements include:

- Stronger route guards and role authorization enforcement on UI and API
- Secure refresh token flow and token rotation
- File upload pipeline (S3/Blob storage) with signed URLs
- Better notification center UX (real-time updates)
- Task comments and threaded review feedback
- Search/filter/sort improvements across dashboards
- Rich analytics and project insights
- Automated testing suite (unit, integration, E2E)
- CI/CD workflows for staging and production
- Performance optimizations and caching
- Improved audit trail and admin governance controls

## Contribution

Contributions, issues, and suggestions are welcome while the project evolves.

If you open an issue, include:
- role used (admin/editor/stakeholder)
- exact page/route
- expected vs actual behavior
- logs or screenshots when possible

## License

Add your preferred license here (MIT, Apache-2.0, etc.).
