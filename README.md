# RupeeRise AI 💸🇮🇳

RupeeRise AI is a **student-focused intelligent budget tracker for the Indian market**. It is designed as a **fintech-grade project** that demonstrates how modern expense tracking systems work **without directly handling money**, staying fully compliant with RBI and academic guidelines.

The project focuses on **smart spending intelligence**, realistic **UPI-based transaction tracking (simulated)**, and **AI-powered insights** to help students manage their finances better.

---

## 🚀 Project Vision

Indian students face rising expenses, irregular allowances, and poor visibility into daily spending. Existing apps are either too generic or too complex.

**RupeeRise AI solves this by:**

* Tracking spending the way students actually pay (UPI-first)
* Showing daily burn rate instead of just monthly totals
* Making finance fun with localized insights like the **Chai-Samosa Index**
* Demonstrating real fintech architecture used in production systems

---

## ✨ Core Features

### 1️⃣ Smart UPI Expense Tracking (Simulated)

* Generates **UPI payment intents** (`upi://pay`)
* User pays via their normal UPI app (Google Pay / PhonePe / Paytm)
* After payment, the user confirms the transaction
* Expense is **automatically added** to the dashboard

> 🔒 No money is processed or stored by RupeeRise AI

---

### 2️⃣ Live Spend Mode (Auto Track)

* Toggle-based **Smart Auto Track** system
* Automatically records confirmed payments as expenses
* Real-time updates to:

  * Dashboard cards
  * Charts
  * Daily Burn Rate

> ℹ️ Live tracking is simulated for demo and educational purposes

---

### 3️⃣ Daily Burn Rate Dashboard 🔥

* Shows how much the user can safely spend **per day**
* Adjusts dynamically based on:

  * Monthly allowance
  * Expenses already made
  * Days remaining
* Warns users if they are overspending early in the month

---

### 4️⃣ What-If Simulator 🧮

* Lets users test scenarios like:

  > “What if I skip 3 coffee orders this week?”
* Shows:

  * Money saved
  * Extra days of budget life
  * Equivalent street food meals

---

### 5️⃣ Chai-Samosa Index ☕🥟

* Converts unnecessary expenses into **street food equivalents**
* City-based pricing (Delhi, Mumbai, Bangalore, etc.)
* Makes spending insights fun, relatable, and memorable

---

### 6️⃣ UPI Message Parsing

* Paste UPI SMS or notification text
* Automatically extracts:

  * Amount (₹)
  * Merchant name
  * Date
* Creates a categorized expense entry

---

### 7️⃣ Payment Gateway Webhook Simulation

* Simulates Razorpay / Cashfree-style webhooks
* Demonstrates real-world payment lifecycle
* Uses **test-mode events only**
* Educates users on fintech backend flows

---

## 🛠️ Tech Stack

### Frontend

* React (Lovable)
* Vite
* Tailwind CSS
* Recharts (data visualization)

### Backend / Cloud

* Lovable Cloud (Supabase-based)
* PostgreSQL
* Edge Functions (TypeScript)

### AI Logic

* Expense categorization
* Spending prediction
* Smart insights & alerts

---

## 🗄️ Database Schema (Simplified)

### transactions

* id
* amount (INR)
* category
* merchant_name
* payment_method (UPI / Cash / Card / Simulated Gateway)
* status (pending / confirmed)
* created_at

### webhook_events

* id
* provider
* payload
* processed_at

### profiles

* user_id
* city
* monthly_allowance
* allowance_date

---

## 🇮🇳 Indian Localization

* Currency: **₹ INR**
* Indian number system (Lakhs / Crores)
* Date format: **DD/MM/YYYY**
* City-based spending context
* Festival-aware budgeting (Diwali, Holi buffers)

---

## 🔐 Compliance & Safety

* ❌ No wallet functionality
* ❌ No direct money transfer
* ❌ No bank account access
* ✅ Expense tracking only
* ✅ RBI-safe and academic-friendly

> RupeeRise AI tracks spending intelligence, not payments

---

## 🎓 Academic & Hackathon Value

This project demonstrates:

* Fintech system design
* UPI ecosystem understanding
* Secure data handling concepts
* Real-time dashboards
* AI-assisted decision making

Perfect for:

* Major project review
* Hackathons
* Fintech internships
* Startup demos

---

## 🔮 Future Scope

* RBI-compliant bank API integration
* Account Aggregator (AA) framework support
* Real SMS parsing on Android
* Personalized AI financial advisor
* Subscription cancellation suggestions

---

## 🧠 Key Design Philosophy

> “We separated payment execution from expense intelligence.
> RupeeRise AI focuses on the data layer — where real fintech innovation happens.”

---

## 👨‍🎓 Built For

Indian students who want:

* Control over spending
* Realistic finance tools
* Simple, friendly, and powerful insights

---

## 📌 Disclaimer

RupeeRise AI is an educational project. All payment-related features are simulated and do not involve real money processing.

---

### ⭐ If you’re reviewing this project:

This is not just an app — it’s a **fintech-ready system design demonstration**.
