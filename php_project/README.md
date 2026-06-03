# Contify PHP - Server-Side Rendered MVC Application

This is a complete PHP 8.3 MVC implementation of the Contify CMS platform. It's a **single unified application** that handles both frontend (HTML rendering) and backend (business logic) on the same server, without a separate JavaScript framework.

## 🎯 Quick Links

- **Running the app**: Jump to [How to Run](#-how-to-run)
- **Setup steps**: Jump to [Setup & Installation](#-setup--installation)
- **Troubleshooting**: See `HELP.md`
- **Project overview**: See root `README.md` for architecture comparison with React+Spring

---

## 📋 Table of Contents

1. [Technology Stack](#-technology-stack)
2. [Architecture](#-architecture)
3. [Setup & Installation](#-setup--installation)
4. [How to Run](#-how-to-run)
5. [Project Structure](#-project-structure)
6. [Database](#-database)
7. [Features](#-features)
8. [Routing](#-routing)
9. [Authentication](#-authentication)
10. [Development Workflow](#-development-workflow)
11. [Troubleshooting](#-troubleshooting)

---

## 🛠️ Technology Stack

**Language & Framework:**
- PHP 8.3+ (strict type declarations)
- Custom MVC router (no external framework like Laravel)
- Object-Oriented Architecture with Repositories pattern

**Frontend:**
- Server-Side Rendering (SSR) - HTML generated on server
- Tailwind CSS for styling
- Vanilla JavaScript (minimal, progressive enhancement)

**Database:**
- MySQL 8.0+ or MariaDB
- PDO extension for database access
- Role-based access control via session

**No External Dependencies:**
- No Composer (lightweight, all PHP code manually managed)
- No npm/Node.js required
- Runs on standard PHP dev server or Apache

---

## 🏗️ Architecture

### How It Works

```
User submits request (click link, form submission)
          ↓
Router (public/index.php) receives request
          ↓
Middleware checks session & permissions
          ↓
Controller processes request
          ├─ Calls Repository for data
          ├─ Calls Database if needed
          └─ Prepares data array
          ↓
View renders HTML using data array
          ↓
PHP generates complete HTML page
          ↓
Browser receives & displays HTML
```

### Key Design Principles

1. **Session-Based Authentication**: Users log in → session created → stored across request
2. **Repository Pattern**: Controllers don't directly access database; use repositories for data queries
3. **Type-Hinted Methods**: All methods have PHP 8.3 strict return types and parameter types
4. **SSR (Server-Side Rendering)**: No JavaScript framework; HTML generated on server
5. **Stateless Controllers**: Each request is independent; no dependency injection needed

---

## ⚙️ Setup & Installation

### Prerequisites

- **PHP 8.3** or higher
- **MySQL 8.0** or MariaDB
- **Command-line access** to run PHP server and MySQL

### Step 1: Install PHP

**Windows:**
```bash
# Download from https://www.php.net/downloads.php
# Or use XAMPP/WAMP which includes PHP + MySQL
choco install php  # if using Chocolatey
```

**macOS:**
```bash
brew install php
```

**Linux:**
```bash
sudo apt-get install php php-cli php-mysql
```

Verify installation:
```bash
php --version
```

### Step 2: Set Up MySQL Database

**Create the database:**
```bash
mysql -u root -p
# Enter your MySQL password when prompted
```

In MySQL console:
```sql
CREATE DATABASE contify_php;
USE contify_php;
```

**Or use command line:**
```bash
mysql -u root -p -e "CREATE DATABASE contify_php;"
```

### Step 3: Run Database Migrations

Navigate to migrations folder and run each migration in order:

```bash
cd php_project/migrations

# Run migrations in order
mysql -u root -p contify_php < 001_create_users.sql
mysql -u root -p contify_php < 002_create_project_requests.sql
mysql -u root -p contify_php < 003_create_project_tasks.sql
mysql -u root -p contify_php < 004_create_notifications.sql
mysql -u root -p contify_php < 005_create_message_threads.sql
mysql -u root -p contify_php < 006_create_messages.sql
mysql -u root -p contify_php < 007_create_task_attachments.sql
mysql -u root -p contify_php < 008_add_cloud_fields_to_task_attachments.sql
# ... run any additional migration files
```

**Verify migrations:**
```bash
mysql -u root -p contify_php -e "SHOW TABLES;"
```

You should see tables like: `users`, `project_requests`, `project_tasks`, `messages`, `notifications`, etc.

### Step 4: Configure Environment

Create `.env` file in `php_project/` directory:

```env
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=contify_php
DB_USER=root
DB_PASS=
```

**Important:** Keep `.env` secure and never commit it. Use `.env.example` as template.

### Step 5: Verify File Permissions

Make sure `php_project/` folder is readable by PHP:

```bash
# Linux/macOS
chmod -R 755 php_project

# Windows (usually automatic, skip if using XAMPP/WAMP)
```

---

## 🚀 How to Run

### Start the PHP Development Server

From the root of the project:

```bash
cd php_project
php -S localhost:8000 -t public
```

**Output should show:**
```
Development Server is running. Listening on http://localhost:8000
Document root is /path/to/CMS_Project/php_project/public
Press Ctrl-C to quit.
```

### Access the Application

Open your browser and navigate to:
```
http://localhost:8000
```

### Login Credentials

No live credentials are stored in this repository.

Use one of these options for local testing:
- Register users from the signup flow for each role.
- Insert your own local test users directly in MySQL.
- Keep any local credential notes in ignored files only (for example, `Credentials.txt`).

### Stop the Server

Press `Ctrl + C` in the terminal running the server.

---

## 📁 Project Structure

```
php_project/
│
├── public/
│   └── index.php                 # Main router - ALL requests go here
│
├── src/
│   │
│   ├── Core/
│   │   ├── Router.php           # URL routing logic
│   │   ├── Controller.php       # Base controller class
│   │   ├── Database.php         # PDO database wrapper
│   │   ├── Session.php          # Session management
│   │   └── View.php             # View rendering helper
│   │
│   ├── Controllers/
│   │   ├── AuthController.php           # Login, signup, logout
│   │   ├── HomeController.php           # Landing page
│   │   ├── AdminPageController.php      # Admin dashboard & pages
│   │   ├── EditorPageController.php     # Editor dashboard & pages
│   │   ├── StakeholderPageController.php # Stakeholder dashboard
│   │   ├── ProjectController.php        # Project workflow
│   │   ├── TaskWorkflowController.php   # Task management
│   │   ├── MessageController.php        # Messaging system
│   │   ├── NotificationController.php   # Notifications
│   │   └── [Additional controllers]
│   │
│   ├── Repositories/
│   │   ├── UserRepository.php
│   │   ├── ProjectRequestRepository.php
│   │   ├── ProjectTaskRepository.php
│   │   ├── MessageRepository.php
│   │   ├── TaskAttachmentRepository.php
│   │   └── [Additional repositories]
│   │
│   ├── Middleware/
│   │   └── AuthMiddleware.php          # Session authentication check
│   │
│   └── [Additional folders as needed]
│
├── views/
│   ├── layouts/
│   │   └── base.php                    # Base template wrapper
│   │
│   ├── admin/
│   │   ├── dashboard.php
│   │   ├── projects.php
│   │   ├── users.php
│   │   ├── analytics.php
│   │   ├── audit-log.php
│   │   └── [more admin pages]
│   │
│   ├── editor/
│   │   ├── dashboard.php
│   │   ├── tasks.php
│   │   └── [editor pages]
│   │
│   ├── stakeholder/
│   │   ├── home.php
│   │   ├── projects.php
│   │   └── [stakeholder pages]
│   │
│   ├── auth/
│   │   ├── login.php
│   │   ├── signup.php
│   │   └── forgot-password.php
│   │
│   ├── messages/
│   │   ├── compose.php                # Message composition
│   │   └── thread.php                 # View single thread
│   │
│   ├── media/
│   │   ├── dashboard.php              # Media workspace
│   │   ├── cloud-media-viewer.php     # Project content viewer
│   │   ├── video-player.php           # Video playback
│   │   └── task-stream-panel.php      # Workflow feed
│   │
│   ├── profile/
│   │   ├── view.php
│   │   └── edit.php
│   │
│   └── [additional view folders]
│
├── config/
│   ├── database.php                    # DB config from .env
│   └── app.php                         # Application settings
│
├── migrations/
│   ├── 001_create_users.sql
│   ├── 002_create_projects.sql
│   ├── 003_create_tasks.sql
│   ├── 004_create_messages.sql
│   ├── 005_create_notifications.sql
│   └── [additional migrations]
│
├── .env.example                        # Template for .env
├── .env                                # (Create this) Database config
├── README.md                           # This file
└── HELP.md                             # Troubleshooting guide
```

---

## 🗄️ Database

### Database Name
- **Database**: `contify_php` (configured in `.env` as `DB_NAME`)

### Schema Overview

**Users Table**
```sql
id, email, name, password_hash, role, created_at, updated_at
```

**Project Requests Table**
```sql
id, stakeholder_id, title, description, status, created_at, updated_at
```

**Project Tasks Table**
```sql
id, project_id, assigned_to_id, title, status, due_date, created_at, updated_at
```

**Messages Table**
```sql
id, thread_id, sender_id, message_text, created_at
```

**Message Threads Table**
```sql
id, participant_a_id, participant_b_id, created_at, updated_at
```

### Running Migrations

All migrations are in `migrations/` folder. Run them in numeric order:

```bash
cd php_project/migrations
mysql -u root -p contify_php < 001_create_users.sql
mysql -u root -p contify_php < 002_create_projects.sql
# ... etc
```

### Resetting Database

To completely reset and start fresh:

```bash
mysql -u root -p -e "DROP DATABASE contify_php; CREATE DATABASE contify_php;"
# Then re-run all migrations
```

---

## ✨ Features

### Authentication
- [x] User login with email/password
- [x] User signup with role selection
- [x] Session-based authentication (no JWT)
- [x] Secure password hashing (bcrypt/password_hash)
- [x] Logout functionality

### Admin Features
- [x] Dashboard with statistics
- [x] View all project requests
- [x] Create and send proposals
- [x] Create and assign tasks
- [x] Review editor submissions
- [x] Approve or request revisions
- [x] Analytics dashboard
- [x] Audit log
- [x] User management
- [x] Financial tracking
- [x] Media dashboard with cloud viewer

### Editor Features
- [x] Personal dashboard
- [x] View assigned tasks
- [x] Submit deliverables
- [x] Track task revisions
- [x] Profile management
- [x] Messaging with other users
- [x] Media workspace
- [x] Task stream (workflow feed)

### Stakeholder Features
- [x] Create project requests
- [x] View own projects
- [x] Review admin proposals
- [x] Accept/reject proposals
- [x] Sign off deliverables
- [x] Rate completed projects
- [x] Message admins/editors
- [x] View media uploads

### System Features
- [x] Notifications system
- [x] Real-time messaging (database-backed)
- [x] Project workflow state machine
- [x] Role-based page access control
- [x] Media dashboard with multiple panels
- [x] Responsive Tailwind CSS design
- [x] Server-side rendering (no frontend build step needed)

---

## 🛣️ Routing

All routes are defined in `public/index.php`. Format:

```php
$router->get('route/path', [ControllerClass::class, 'methodName']);
$router->post('route/path', [ControllerClass::class, 'methodName']);
```

### Public Routes (No Login Required)
- `GET /` - Home/landing page
- `GET /login` - Login page
- `POST /login` - Process login
- `GET /signup` - Signup page
- `POST /signup` - Process signup
- `GET /forgot-password` - Forgot password page

### Authenticated Routes

**Admin Routes** (`/admin/...`)
- `GET /admin` - Dashboard
- `GET /admin/projects` - Project list
- `GET /admin/projects/:id` - Project detail
- `GET /admin/users` - Manage users
- `GET /admin/analytics` - Analytics
- `GET /admin/audit-log` - Audit log
- `GET /admin/media`, `/admin/streaming` - Media dashboard

**Editor Routes** (`/editor/...`)
- `GET /editor` - Dashboard
- `GET /editor/tasks` - Task list
- `GET /editor/media`, `/editor/streaming` - Media dashboard
- `GET /editor/profile` - Profile page
- `POST /editor/profile/update` - Update profile

**Stakeholder Routes** (`/stakeholder/...`)
- `GET /stakeholder` - Home page
- `GET /stakeholder/projects` - Project list
- `GET /stakeholder/media`, `/stakeholder/streaming` - Media dashboard

**Shared Routes**
- `GET /messages/compose` - Compose message
- `GET /messages/:id` - View thread
- `POST /messages/send` - Send message
- `GET /profile` - User profile
- `POST /notifications/:id/read` - Mark notification read

---

## 🔐 Authentication

### How It Works

1. User enters email/password on login page
2. `AuthController::login()` receives form submission
3. Validates credentials against database
4. If valid, creates session: `$_SESSION['auth_user'] = ['id', 'email', 'name', 'role']`
5. Redirects to role-specific dashboard
6. Subsequent requests check session via `AuthMiddleware`

### Session Format

```php
$_SESSION['auth_user'] = [
    'id' => 1,
    'email' => 'admin@example.com',
    'name' => 'Admin User',
    'role' => 'Admin'  // Admin, Editor, or Stakeholder
];
```

### Protected Routes

```php
// Check auth in any controller:
use App\Core\Session;

$user = Session::get('auth_user');
if (!$user) {
    // Not logged in, redirect to login
    header('Location: /login');
    exit;
}
```

### Password Security

```php
// Hash password during signup
$hash = password_hash($plaintext, PASSWORD_BCRYPT);

// Verify password during login
if (password_verify($plaintext, $hash)) {
    // Password correct
}
```

---

## 🔄 Development Workflow

### Adding a New Page

1. **Create Controller Method**
   ```php
   // src/Controllers/AdminPageController.php
   public function newpage(): void
   {
       $data = ['title' => 'New Page'];
       $this->render('admin/newpage', $data);
   }
   ```

2. **Create Route**
   ```php
   // public/index.php
   $router->get('/admin/newpage', [AdminPageController::class, 'newpage']);
   ```

3. **Create View**
   ```php
   // views/admin/newpage.php
   <div class="container">
       <h1><?= htmlspecialchars($title) ?></h1>
   </div>
   ```

4. **Test**
   ```bash
   # Server already running on localhost:8000
   # Navigate to http://localhost:8000/admin/newpage
   ```

### Adding a New Database Table

1. **Create migration file** in `migrations/`
   ```sql
   -- migrations/006_create_newtable.sql
   CREATE TABLE new_table (
       id INT PRIMARY KEY AUTO_INCREMENT,
       ...
   ) ENGINE=InnoDB;
   ```

2. **Run migration**
   ```bash
   mysql -u root -p contify_php < migrations/006_create_newtable.sql
   ```

3. **Create Repository**
   ```php
   // src/Repositories/NewTableRepository.php
   class NewTableRepository {
       public function find(int $id): ?array { ... }
       public function findAll(): array { ... }
       public function create(array $data): int { ... }
   }
   ```

4. **Use in Controller**
   ```php
   $repo = new NewTableRepository();
   $items = $repo->findAll();
   ```

### Testing Changes

After making changes, just refresh the browser. No build step needed:

```bash
# Server still running? Just reload page
# http://localhost:8000/...
```

Changes to PHP files take effect immediately.

---

## 🐛 Troubleshooting

For detailed troubleshooting, see `HELP.md`

### Common Issues

**"Can't connect to database"**
- Verify MySQL is running
- Check `.env` has correct database credentials
- Run migrations

**"Class not found" error**
- Verify autoloader in `public/index.php`
- Check file names match `App\ClassName` mapping

**"Session not persisting"**
- Check browser allows cookies
- Verify `session_start()` called in Router

**"404 on /admin/page"**
- Check route defined in `public/index.php`
- Verify controller method exists
- Check middleware allows access

**PHP Server stops abruptly**
- Check terminal for error message
- Verify `.env` is readable by PHP
- Try: `php -S localhost:8000 -t public 2>&1`

For more help: See `HELP.md` or check error logs.

---

## 📚 Additional Resources

- **Set up guide**: This file (you're reading it)
- **Troubleshooting**: `HELP.md`
- **Architecture overview**: Root `README.md`
- **Database schema**: Check `migrations/` files
- **PHP Code Standards**: All code uses PHP 8.3 strict types

---

## 🎓 Learning Resources

**Understanding SSR vs SPA:**
- This app is **Server-Side Rendered** (SSR)
- Compare with React+Spring which is **Single-Page App** (SPA)
- See root `README.md` for architecture comparison

**PHP 8.3 Features Used:**
- Strict type declarations (`declare(strict_types=1)`)
- Typed properties and return types
- Match expressions
- Named arguments
- Constructor property promotion

**MVC Pattern:**
- **Model** = Database (Repositories)
- **View** = Templates (.php files)
- **Controller** = Business logic (Controllers/)

---

## 👥 Contributing to PHP Application

When adding features:
1. Follow the existing code style
2. Add type hints to all methods
3. Use Repository pattern for data access
4. Update views with Tailwind classes
5. Test on http://localhost:8000 before committing

---

## 📞 Need Help?

- **Not working?** Check `HELP.md`
- **Want to understand architecture?** See root `README.md`
- **Need route reference?** See Routing section above
- **Database issues?** Check migrations/ folder and `HELP.md`

## 🔐 Security Notes

- Stakeholder project actions are limited to the logged-in owner of that project.
- Admin-only workflow actions remain restricted by role checks in the controller layer.
- Keep local `.env` files and any credential notes out of Git before publishing the final repository.
