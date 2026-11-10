# AURA TECH - Official Web Platform & Enterprise CRM Operations Suite

> Modern, responsive web platform and unified operations management suite for **AURA TECH**.

---

## 🌟 Key Highlights

* **Public Web Platform:**
  * **Student & Professional Solutions:** Interactive project catalog, customized quote calculators, and automated project registrations.
  * **HR & Careers Portal:** Open technical roles, culture showcase, and instant application workflows.
  * **AI Chat Assistant:** Context-aware interactive assistant powered by Gemini.
  * **Interactive Experience:** Smooth office interfaces, ambient animations, and light/dark theme toggles.

* **Enterprise CRM & Operations Suite:**
  * **Project Inquiries Inbox:** Manage inbound leads across pipeline stages (*New* → *Reviewed* → *Contacted* → *Converted* → *Rejected*).
  * **7 Core Staff Profiles:** Workload distribution, assigned responsibilities, and performance metrics for:
    * **Niranjan** (`EMP001` - Full-Stack Developer)
    * **Makizh** (`EMP002` - Full-Stack Developer & Lead)
    * **Hariharan** (`EMP003` - Full-Stack Developer & Video Editor)
    * **Priyanka** (`EMP004` - UI/UX Designer & Video Editor)
    * **Dhanya** (`EMP005` - Full-Stack Developer & Web Designer)
    * **Praveen Raja** (`EMP006` - UI/UX Designer & Script Writer)
    * **Vengateshwaran** (`EMP007` - Frontend Developer & Designer)
  * **Client & Project Management:** Full client directory, budget allocations, milestone monitoring, and delivery timelines.
  * **Task & Sprint Management:** Sprint tracking, task assignments, status boards, and blocker notifications.
  * **Invoicing & Indian Rupee Billing:** Generates GST invoices in `₹` with words conversion, downloadable PDF with founder signature, and Word (`.docx`) exports.
  * **Work Reports & Performance Logs:** Filterable by employee, client, project, or date with PDF & CSV export.

* **Background Synchronization Engine:**
  * Real-time automated ingestion from website booking forms into CRM.
  * Dual cloud persistence with Supabase (`crm_*` schemas) and local-first fallback.
  * Automatic webhook dispatch to Google Sheets and email notifications.

---

## 🚀 Quick Start

### 1. Installation
```bash
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🔐 Portals & Routes

| Route | Description | Access |
|---|---|---|
| `/` | Public Web Platform | Open to all visitors |
| `/admin` | Central Admin Dashboard | Admin credentials (`admin` / `123`) |
| `/crm` | Enterprise Operations Suite | Admin & Employee Workspaces |
| `/portal` | Dedicated Staff Workspace | 7 Core Team Members |

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS
* **Routing:** React Router v7
* **Database & Cloud:** Supabase (`@supabase/supabase-js`), Google Apps Script Webhook
* **Document Generation:** jsPDF, jsPDF-AutoTable, docx
* **Icons & UI:** Lucide React, Canvas Confetti

---

## 📄 License

Proprietary © 2026 AURA TECH. All rights reserved.

