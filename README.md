# Smart Hostel Room Selection & Maintenance System

React (Vite) frontend + Node/Express backend + MySQL. Express serves the built frontend, so after setup the whole app runs on **http://localhost:3000**.

```
hostel/
  db/        schema.sql  seed.sql  roles.sql  tools/gen-seed.js
  backend/   Express API (JWT + bcrypt, mysql2)   -> src/, tests/, .env
  frontend/  React + TS + Tailwind (talks to /api)
```

## 1. Database (MySQL 8 or XAMPP/MariaDB)
Run in this order (phpMyAdmin > Import, or the mysql CLI from the `hostel` folder):
```
mysql -u root -p < db/schema.sql
mysql -u root -p < db/seed.sql
mysql -u root -p < db/roles.sql
```
`schema.sql` DROPS and recreates the `hostel` database. `roles.sql` creates the `hostel_app` user used by the backend.

## 2. Backend
```
cd backend
copy .env.example .env      (Linux/Mac: cp .env.example .env)   # edit DB_PASSWORD / JWT_SECRET if you changed them
npm install
npm test                    # optional: 6 integration tests incl. a 20-way double-booking race
```

## 3. Frontend (build once)
```
cd frontend
npm install
npm run build               # creates frontend/dist, which the backend serves
```

## 4. Run
```
cd backend
npm start                   # open http://localhost:3000
```
Frontend dev mode with hot reload: `npm run dev` in `frontend/` (port 5173, proxies /api to :3000; backend must be running).

## Demo logins (role selector on the login page)
| Role | ID / email | Password |
|---|---|---|
| Student | PES220001 or arjun.sharma@pes.edu | student123 |
| Warden | WARDEN001 or warden@pes.edu | warden123 |
| Maintenance | STAFF001 or ramesh.k@pes.edu | staff123 |

New students can self-register; wardens/staff are pre-provisioned in the seed.

## How the pieces connect
- `frontend/src/api.ts` = fetch wrapper (JWT in localStorage). `frontend/src/store.tsx` = app state; every action calls the API then reloads; data refreshes every 15 s.
- Allocation approval calls the `allocate_bed` stored procedure (row lock + unique indexes), so two students can never get the same bed.
- Triggers keep bed status, complaint history and resolved-time consistent.
