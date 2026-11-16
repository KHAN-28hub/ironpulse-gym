# ⚡ IronPulse | Elite Gym Management & Fitness Intelligence Platform

IronPulse is a production-grade, multi-tenant capable, mobile-first Gym Management & Athlete Super-App ecosystem built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma ORM, and SQLite.

---

## 🚀 Live Access & Quick Start

The platform is running locally at:
👉 **`http://localhost:3000`** *(or `http://192.168.0.12:3000` on local Wi-Fi)*

### Quick 1-Click Demo Credentials
On the landing page, click the **Quick 1-Click Demo Login** buttons or use these credentials:

| Role | Email / Identifier | Password | Name | Focus / Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Gym Owner (Boss)** | `owner@ironpulse.fit` | `ironpulse123` | Marcus Vance | Full multi-branch authority, revenue analytics, staff payroll |
| **Member (Athlete)** | `member@ironpulse.fit` | `ironpulse123` | Alex Rivera | Annual VIP Pass, 18-day streak, Level 7 (3450 XP) |
| **Trainer (Coach)** | `trainer@ironpulse.fit` | `ironpulse123` | Sarah Connor | Lead CrossFit & Strength, 4.95★ rating, 48 reviews |

---

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Lucide Icons + Recharts + Framer Motion
- **Design System**: Dark-first luxury aesthetic (`#08090d` obsidian with `#ccff00` electric lime & `#ff5500` blaze orange), glassmorphism cards, micro-interactions, responsive mobile bottom tab bar & desktop sidebar
- **Backend**: Next.js API Routes (`/api/owner/*`, `/api/member/*`, `/api/trainer/*`, `/api/auth/*`)
- **Database & ORM**: SQLite (`prisma/dev.db`) + Prisma ORM (20+ comprehensive relational models)
- **Authentication**: JWT stored in httpOnly cookies, password hashing with bcryptjs, role-based access control (RBAC)
- **Multi-Language (i18n)**: English (EN), Hindi (HI - हिंदी), Telugu (TE - తెలుగు)
- **Theme**: Dark mode default with light mode toggle

---

## 📋 Comprehensive Feature Checklist

### 1. Entry Flow & Authentication
- [x] Stunning role-selection landing page with animated cards ("I'm the Gym Owner", "I'm a Member", "Trainer & Staff Access")
- [x] 1-Click Instant Demo Login bar for instant zero-friction testing
- [x] Owner login with email, password, optional 2FA switch, and biometric/face unlock placeholder
- [x] Member login with email/phone, password, and gym-code sign-up (`IRONPULSE2026`)
- [x] Role-based redirection to dedicated dashboard routes (`/owner/dashboard`, `/member/dashboard`, `/trainer/dashboard`)

### 2. Owner (Boss) Panel (`/owner/dashboard`)
- [x] **Executive Business Dashboard**:
  - Revenue today, week, month, and annual projection with growth indicators
  - Active vs expired vs frozen vs pending members breakdown
  - Churn rate calculation and new joins tracker
  - Peak hours attendance heatmap (hourly curve from 06:00 to 22:00)
  - Trainer performance leaderboard with ratings and review counts
  - Live "people in gym now" real-time counter (18 athletes currently on floor)
- [x] **Member Management**:
  - Full CRUD: Add, edit, delete members
  - Search by name, email, phone, or QR code; filter by status
  - View member profiles with ID proof (Passport, Driver's License, Aadhaar), emergency contact, health notes, blood group
  - Freeze, pause, resume, and transfer memberships across branches
  - 1-Click CSV/Excel export and download
- [x] **Plans & Pricing**:
  - Monthly Flex Pass ($49), Quarterly Pro ($129), Annual Elite VIP ($399)
  - Promo coupon management (`SUMMER20`, `IRON50`, `WELCOME10`)
  - Revenue add-ons (Personal Training, Infrared Sauna, Dedicated Smart Locker, Shakes)
  - Referral reward engine ($25 reward + 14 free days)
- [x] **Billing, Payments & Invoices**:
  - Invoices list with status (PAID, REFUNDED, PENDING)
  - Printable/Downloadable PDF invoice viewer with 18% GST tax breakdown
  - Operating expense tracker (Rent, Utilities, Maintenance, Supplements, Marketing, Payroll)
  - Real-time Profit & Loss statement calculation (Net Margin %)
- [x] **Attendance Hub**:
  - Interactive turnstile QR scanner simulator: instant validation against member database, access granted / denied rules, and chime
  - Attendance history logs with check-in and check-out timestamps
- [x] **Trainer & Staff Management**:
  - Certified coach roster with specialties, client loads, base salaries, and PT commissions
  - Facility staff roster with shifts (Front Desk, Maintenance, Sanitation) and monthly payroll
- [x] **Class & Schedule Management**:
  - Studio timetable (HIIT, Yoga, CrossFit, Zumba, Boxing)
  - Capacity limits, live booked count, and waitlist tracking
  - Add new class modal
- [x] **Equipment & Locker Management**:
  - Interactive 25-locker visual grid map (Green = Available, Red = Occupied, Yellow = Maintenance)
  - Commercial equipment inventory with service due dates and issue reporting
  - Pro shop supplement inventory (Whey, Creatine, Pre-workout) with low-stock alerts
- [x] **Multi-Branch Support**:
  - Branch switcher: Downtown Flagship, Uptown Elite, Metro West
- [x] **Marketing & Lead CRM**:
  - Lead pipeline (Enquiry → Trial Booked → Converted → Lost)
  - WhatsApp, SMS, and Push campaign automations
  - Member birthday perks and 7-day renewal reminder automations
- [x] **Settings**:
  - Gym profile, operating timings, GSTIN/Tax ID, and holiday calendar

### 3. Member App (`/member/dashboard`)
- [x] **Home Feed**:
  - Today's workout prompt and quick launch
  - 18-day streak counter with fire flame badge
  - Calorie and water circular progress meters
  - Upcoming class card with countdown
  - Motivational fitness quote of the day
- [x] **Digital Holographic QR Card**:
  - Personal QR code badge with barcode and member ID
  - 1-Click "Simulate Gate Check-in" button directly on card
- [x] **Workouts & Exercises**:
  - 6-Day Aesthetic Hypertrophy (PPL) split
  - Exercise library with instructions and muscle groups
  - Active workout logger: sets, reps, weight (kg), and RPE
  - Interactive rest timer widget (60s, 90s countdown with sound notification)
  - Personal records (PR) tracker
- [x] **Diet & Nutrition**:
  - Daily meal protocol (Breakfast, Lunch, Pre/Post Workout, Dinner)
  - Calorie & macro targets (Protein, Carbs, Fats)
  - Interactive water tracker (+250ml / +500ml quick buttons)
  - PulseAI nutrition and meal recommendations
  - Barcode scanner modal placeholder
- [x] **Body Progress**:
  - Weight, BMI, and body fat % summary
  - Recharts metric trend timeline chart
  - Physique progress photo timeline slider
- [x] **Class Booking**:
  - Browse HIIT, Yoga, CrossFit, Zumba with real-time spots left
  - 1-Click Book / Cancel with instant confirmation
- [x] **Personal Trainer & Chat**:
  - Coach Sarah Connor profile and 1-on-1 PT booking ($65)
  - In-app live chat thread with simulated instant coach replies
- [x] **Payments & Renewals**:
  - Current plan and expiration status
  - Renew/upgrade pass modal with Stripe test mode & UPI/Razorpay options
  - Coupon code validator (`SUMMER20`, `IRON50`)
  - Auto-pay toggle and past receipts download
- [x] **Gamification & Community**:
  - XP counter, Level 7 badge, unlocked badges
  - Monthly challenges with join actions
  - Gym-wide leaderboard
  - Social wall: workout shares, likes, and comments
- [x] **PulseAI Coach Assistant**:
  - Real-time AI fitness chatbot answering biomechanics, form cues, injury modifications, and macro advice
- [x] **Wearable Sync Placeholders**:
  - Apple Health, Google Fit, Fitbit status cards

### 4. Trainer Panel (`/trainer/dashboard`)
- [x] Client roster cards with streak, current weight, and health notes
- [x] Client deep-dive view
- [x] Assign custom workout plan or diet plan to clients modal
- [x] Client direct chat box
- [x] Monthly earnings breakdown ($4,200/mo: Base salary + PT commissions)
- [x] Reviews and 4.95★ rating display

---

## 🧪 Testing

Run the automated unit test suite:
```bash
node scripts/test-suites.js
```

Run the complete headless browser test suite (with screenshot captures):
```bash
node scripts/qa-all.js
```

---

## 🔍 Placeholders & Demonstrations

The following features have realistic, functional simulation placeholders designed for zero-friction demo evaluation without requiring third-party credentials:
1. **Biometric / Face ID Unlock**: Simulated 1.2-second facial scan on login card that logs in the primary demo user.
2. **Barcode Scanner**: Visual camera viewport placeholder with simulated 1D/2D barcode detection logging nutrition data.
3. **Payment Gateways**: Stripe Test Mode & UPI/Razorpay checkout simulation with coupon validation and instant invoice generation.
4. **WhatsApp & SMS Gateway**: Campaign and renewal reminder trigger simulations with mock delivery receipts.
5. **Wearable Health Sync**: Apple Health & Google Fit status cards showing synced step counts and active connection status.
