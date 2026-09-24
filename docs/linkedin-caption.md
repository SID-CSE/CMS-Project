# Contify CMS LinkedIn Caption

Built Contify CMS, a role-based content management workflow platform designed for coordinated work between stakeholders, admins, and editors.

The project brings together two implementation styles in one repository:

- React + Spring Boot for a modern API-driven experience
- PHP 8.3 MVC for a server-rendered, session-based version of the same workflow

What it covers:

- Role-based authentication and navigation
- Project request, planning, and delivery workflow
- Task assignment and review flow
- Notifications and messaging
- Media/content dashboards
- MySQL-backed persistence across the system

Infrastructure note: media files and streaming assets are stored in Cloudinary (cloud media storage + CDN) rather than local storage, enabling scalable uploads, streaming, and signed delivery.

A detail I’m especially happy with is how the workflow stays role-aware across the stack, with stakeholder actions, admin review paths, and editor execution all routed through clear boundaries.

This build also includes updated documentation, a release architecture diagram, and final validation of the client build and PHP controllers.

Tech stack:
React, Vite, Spring Boot, PHP 8.3, MySQL, Tailwind CSS

#WebDevelopment #FullStack #ReactJS #SpringBoot #PHP #MySQL #MVC #SoftwareEngineering #PortfolioProject #LinkedInProjects