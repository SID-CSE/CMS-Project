I built Contify CMS — a role-based content management workflow platform that supports stakeholders, admins, and editors across the project lifecycle.

This repository contains two working implementations: a modern SPA using React + Spring Boot (API-driven, JWT-ready) and a server-rendered PHP 8.3 MVC variant (session-based auth). The system covers project requests → plan → delivery workflows, task assignment and review, messaging and notifications, and a media dashboard with content previews and attachments.

Key highlights:
- Clear role boundaries (Stakeholder, Admin, Editor) enforced in the controllers and routing
- MySQL-backed persistence with migration scripts for reproducibility
- Comprehensive API docs for the Spring backend in `server/API_DOCUMENTATION.md`
- Updated documentation and an architecture diagram in `docs/`
- Cloud media storage: media uploads, streaming URLs, and CDN delivery are handled via Cloudinary (not local disk storage) for scalability and signed delivery.

If you want a quick demo or the production-ready containerization steps, I can prepare a short walkthrough and a deployment script next.

#WebDevelopment #FullStack #React #SpringBoot #PHP #MySQL #PortfolioProject