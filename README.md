# DEVDYNAMO.DELHI — Official Hackathon Website

[![Status](https://img.shields.io/badge/Status-Production%20Ready-00f0ff?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-MIT-ff5500?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/Stack-Vanilla%20ES6%20%7C%20CSS3%20%7C%20HTML5-00ff88?style=flat-square)](#)

> **Build. Break. Experiment. Ship.**  
> A high-energy, developer-focused hackathon website designed with an authentic cyber/hacker aesthetic and Delhi tech identity.

---

## 🚀 Live Preview & Architecture

This website is built using modern **Vanilla ES6 Modules, semantic HTML5, and responsive CSS3**.
- **100% Zero-Dependency & Buildless**: No webpack/vite compilation locks. Fast, lightweight, and loads instantaneously with top Lighthouse scores.
- **Centralized Data Layer**: All event details, challenges, schedules, prizes, and sponsors are isolated inside `data/*.js`. Organizers can update dates, venues, links, and text in seconds without breaking any HTML or CSS.
- **Strict Authenticity Standard**: Zero fictional sponsors, dates, or prize amounts. All unconfirmed items cleanly state **"To Be Announced"**.
- **Community Partner Segregation**: Community partners (such as **German Crab**) are distinguished from financial sponsors.

---

## 📂 Project Structure

```text
DEVDYNAMO.DELHI/
├── index.html            # Main semantic markup & section anchors
├── style.css             # Cyberpunk design system, responsive grid, animations
├── script.js             # Core interactive logic (modals, filters, accordion, easter eggs)
├── README.md             # Organizer guide and deployment documentation
│
└── data/                 # CENTRALIZED EVENT DATA (Single Source of Truth)
    ├── eventConfig.js    # Global settings, date, venue, registration URL, socials
    ├── challenges.js     # Problem statements, categories, difficulty, requirements
    ├── schedule.js       # Milestones, timeline flow, phase details
    ├── prizes.js         # Podium rankings, track awards, universal hacker perks
    ├── sponsors.js       # Sponsor tiers (TBA) and Community Partners (German Crab)
    └── faq.js            # Comprehensive participant FAQ accordion items
```

---

## 🛠️ Organizer Maintenance Guide

You do **not** need to touch `index.html` or `style.css` to update event details. Simply edit the corresponding file in `data/`:

### 1. Update Event Dates, Venue & Registration Link
Open `data/eventConfig.js`:
```javascript
export const eventConfig = {
  name: "DEVDYNAMO.DELHI",
  // Update display date
  dateDisplay: "November 14–15, 2026",
  // Set ISO date to automatically activate live countdown timer
  dateIso: "2026-11-14T09:00:00+05:30",
  // Update venue
  venue: "IIT Delhi / NSUT / Tech Park, Delhi NCR",
  // Update registration URL (Devfolio, Unstop, or Google Form)
  registrationUrl: "https://devfolio.co/devdynamo-delhi",
  registrationStatus: "Open",
  contactEmail: "organizers@devdynamo.delhi"
};
```

### 2. Add or Edit Sponsors
Open `data/sponsors.js`:
- Only confirmed sponsors are added to `sponsorTiers`.
- Community partners (e.g., **German Crab**) are maintained in `communityPartners`.
```javascript
// Example: Updating a Gold Sponsor once confirmed
{
  name: "Google Cloud",
  isPlaceholder: false,
  logo: "https://your-cdn.com/google-cloud.svg",
  url: "https://cloud.google.com",
  statusText: "Confirmed Gold Partner"
}
```

### 3. Add or Edit Problem Statements
Open `data/challenges.js`:
- Supports categories: `web`, `ai`, `social`, `open`.
- Updates automatically propagate to category filter tabs and details modal.

### 4. Update Prize Amounts
Open `data/prizes.js`:
- Change `"₹[To Be Announced]"` to official amounts once confirmed (e.g., `"₹50,000"`).

---

## 🕹️ Interactive Features & Easter Eggs

- **Dynamic Challenge Filtering**: Instant category switching (All, Web3 & Cloud, AI, Social Impact, Open Innovation) with detailed modal popups.
- **Accessible Accordion FAQ**: Keyboard navigatable (`Tab`, `Enter`, `Space`) with smooth CSS animation.
- **Scroll Spy & Sticky Navbar**: Shrinks smoothly on scroll and highlights the active section in view.
- **Konami Code Secret Terminal**: Press:
  $$\uparrow \ \uparrow \ \downarrow \ \downarrow \ \leftarrow \ \rightarrow \ \leftarrow \ \rightarrow \ \text{B} \ \text{A}$$
  Opens a retro interactive hacker terminal with commands like `help`, `about`, `delhi`, `matrix`, and `exit`.
- **Developer Console Greeting**: Open DevTools (`F12`) to inspect the custom ASCII banner and source invitation.

---

## 🌐 Deployment Instructions

Since this repository is completely static, it can be deployed in under 60 seconds with zero build steps:

### Option A: GitHub Pages
1. Push repository to GitHub.
2. Go to **Settings > Pages**.
3. Under **Build and deployment**, select **Source: Deploy from a branch** and pick `main` / `/ (root)`.
4. Click **Save**. The website is live.

### Option B: Vercel
1. Run `npx vercel` or connect the GitHub repository in the Vercel Dashboard.
2. Framework Preset: **Other**.
3. Build Command: *leave empty*.
4. Output Directory: *leave empty*.
5. Click **Deploy**.

### Option C: Netlify
1. Drag and drop the `DEVDYNAMO.DELHI` folder into [Netlify Drop](https://app.netlify.com/drop).
2. Or connect the Git repository; set Publish directory to `.`.

---

## 📄 License
Released under the MIT License for the DEVDYNAMO.DELHI organizing team and open-source community.
