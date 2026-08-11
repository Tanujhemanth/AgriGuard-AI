# 🌾 AgriGuard AI — Agriculture & Climate Resilience Platform

> **AI-Powered Real-Time Bridge Between Raw Field Conditions and Expert Agronomic Guidance**

AgriGuard AI is a competition-ready Next.js application that converts unstructured field signals — crop leaf photographs, GPS coordinates, live micro-climate weather — into instant, actionable agronomic advisories for farmers.

---

## 🚀 Key Features & Architecture

### 1. **Multi-Modal Field Input Suite**
- **Foliar Photo Scanner**: Drag & drop upload, mobile camera integration, image type & 10MB size validation.
- **Pre-Calibrated Sample Library**: 1-click test photos (Tomato Late Blight, Rice Blast, Wheat Yellow Rust, Corn Rust, Potato Blight) for instant demonstration.
- **GPS & Location Signal**: Browser HTML5 Geolocation API with manual city & coordinate lookup fallback.

### 2. **AI Computer Vision Engine**
- Real-time foliar pathology visual diagnosis.
- Disease identification, confidence score, pathogen classification (Fungal, Bacterial, Viral, Pest, Nutrient Deficiency).
- **Lesion Heatmap Overlay**: Interactive canvas bounding-box hotspot viewer.
- **Visual Quality Assessment**: Score (0-100) based strictly on observable leaf surface traits.

### 3. **Deterministic Agronomic Decision Engine**
Combines AI pathology output with live Open-Meteo weather parameters (Temperature, Humidity, Rain Probability %, Wind Speed, 24h forecast) to determine exact action status:
- **`ACT NOW`** (Green): Favorable spraying conditions.
- **`WAIT`** (Amber/Red): High risk of rain wash-off (>40%) or wind drift (>15 km/h).
- **`MONITOR / REASSESS`** (Blue): Mild severity or low-confidence status.

### 4. **Prominent 4-Question Farmer Advisory**
1. **WHAT'S WRONG**: Crop, condition, severity label (Light/Moderate/Severe/Critical), AI confidence %.
2. **HOW TO RESPOND**: Dual protocol tabs — Organic / Bio-remedies vs Targeted Chemical Intervention, dosage guidelines, PPE safety gear checklist, mandatory product label disclaimer.
3. **WHEN TO ACT**: Recommended time window (e.g., "Tomorrow 06:00 AM - 09:00 AM"), weather barriers evaluated.
4. **WHY**: Transparent step-by-step decision trail.

### 5. **Agricultural Risk & Security Dashboard**
- **Crop Health Score (0-100)** with contributing stress breakdown (Disease impact, Visible damage, Weather stress).
- **Crop Security Dashboard**: Disease Risk, Pest Risk, Climate Risk, Water Stress Risk, Overall Risk Score (0-100).

### 6. **Export & Field Share**
- Printable Agronomic Certificate modal.
- 1-Click WhatsApp text broadcast generator.
- LocalStorage history drawer.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router, Server API Routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Glassmorphic Agritech UI
- **Icons**: Lucide React
- **Live Weather API**: Open-Meteo (Free high-precision 24h hourly forecast API)
- **Vision AI**: Server-side Gemini 1.5 Flash / GPT-4o Vision API with intelligent offline fallback matcher

---

## 📦 Quick Start & Local Execution

### Prerequisites
- Node.js 18.x or 20.x installed
- npm or yarn

### Installation Steps

1. **Clone & Install Dependencies**
   ```bash
   git clone https://github.com/your-org/agriguard-ai.git
   cd agriguard-ai
   npm install --legacy-peer-deps
   ```

2. **Configure Environment Variables (Optional)**
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(Note: The application automatically runs with built-in high-precision agronomic feature analysis if no API keys are configured, ensuring 100% offline hackathon reliability!)*

3. **Start Local Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Production Build & Verification**
   ```bash
   npm run build
   npm run start
   ```

---

## 📄 License
Designed & built for individual hackathon competition. All rights reserved.
