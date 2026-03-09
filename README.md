# HomeScout — Multifamily Deal Finder & Lead Management Platform (MERN Stack)

A full‑stack property analysis and lead‑management web application designed for real‑estate investors, wholesalers, and flippers. Built using the **MERN stack**, HomeScout includes secure authentication, multifamily property search, advanced filtering, deal scoring, saved properties, and a CRM workflow with notes and status tracking. All data is backed by **MongoDB**.


---

## 🚀 Features

### 🔐 Authentication & Authorization
- Secure login and registration with **JWT stored in httpOnly cookies**
- Protected backend routes
- User‑specific saved properties and CRM metadata

### 🏘️ Multifamily Property Search Engine
- Search by address or city
- Advanced property filters:
  - Price range
  - Units
  - Vacancy
  - Auction status
  - Condition score
- Backend-powered sorting:
  - Deal Score
  - Equity
  - Price (low → high / high → low)
- Paginated results

### ⭐ Saved Deals
- Save and unsave deals tied to the authenticated user
- Persisted in MongoDB
- Includes ARV, repairs, equity, and seller information

### 📝 CRM for Each Deal
- Track lead status: New, Contacted, Negotiating, Offer Made, Under Contract, Closed, Dead Lead
- Add and edit notes per deal
- Fully synced to MongoDB

### 📊 Dashboard Analytics
- Total saved deals
- Average deal score
- Average estimated equity
- Vacant and auction deal counts
- Count of 5+ unit deals
- Status breakdown (New → Closed)

---

## 🧱 Tech Stack

### Frontend
- React (Vite)
- React Router
- TailwindCSS
- Context API (Auth state)
- Reusable components and fetch wrapper

### Backend
- Node.js / Express
- MongoDB Atlas + Mongoose
- JWT (httpOnly cookies)
- Modular routing structure
- Clean error handling

### Database
- MongoDB Atlas
- Structured models: User, Lead, UserLeadMeta
- Seeded with realistic multifamily properties for NJ/NY

---

## 📁 Project Structure

```
homescout/
  client/
    src/
      pages/
        Home.jsx
        Dashboard.jsx
        Favorites.jsx
        Login.jsx
        Register.jsx
        PropertyDetails.jsx
      components/
        PropertyCard.jsx
      context/
        AuthContext.jsx
      lib/
        api.js
      App.jsx
      main.jsx
    index.css

  server/
    models/
      User.js
      Lead.js
      UserLeadMeta.js
    routes/
      auth.js
      leads.js
      userLeads.js
    db.js
    index.js
    seed.js
```

---

## 🔧 Setup Instructions

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd homescout
```

### 2. Install Backend Dependencies
```bash
cd server
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../client
npm install
```

### 4. Create `/server/.env`
```
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_long_random_secret
PORT=5050
```

### 5. Seed Database
```bash
cd server
node seed.js
```

### 6. Start Backend
```bash
npm run dev
```

### 7. Start Frontend
```bash
cd ../client
npm run dev
```

Application runs at **http://localhost:5173**

---

## 🧪 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |

### Properties
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/properties` | Search/filter deals |
| GET | `/api/properties/:id` | Property details |

### User Deals / CRM
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/my/saved-deals` | Get saved deals |
| POST | `/api/my/leads/:id/save` | Save a deal |
| DELETE | `/api/my/leads/:id/save` | Unsave a deal |
| GET | `/api/my/leads/:id/meta` | Fetch CRM metadata |
| PUT | `/api/my/leads/:id/meta` | Update CRM metadata |

---

## 🎯 Skills Demonstrated
- Full-stack application architecture
- REST API design
- Authentication & authorization (JWT cookies)
- React component architecture
- Database design with relational mappings
- Search, filtering, and sorting logic
- Real-world SaaS dashboard and CRM patterns
- Responsive UI/UX using Tailwind

---

## 📍 Roadmap (Future Enhancements)
- Zillow API or MLS data integration
- Interactive Map Search
- AI-powered deal scoring engine
- Email password reset
- Team accounts with multi-user permissions
- Deal import/export
- Kanban-style pipeline

---

## 📞 Contact
**Developer:** Dan (New Jersey / New York)  
**Role Focus:** Full-Stack Engineer, Software Engineer  
**Open To:** Interviews, take‑home projects, and technical screenings

