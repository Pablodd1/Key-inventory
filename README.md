# Miami Auto-Key ERP & Field Diagnostic System

A mobile-first Web ERP, real-time inventory management system, and roadside diagnostic tool suite tailored for **Automotive Locksmiths & Mobile Mechanics** operating in South Florida and urban dispatch zones.

---

## 🔑 Key Scope Clarification: Physical vs. Software Keys

> **CRITICAL ARCHITECTURAL DISTINCTION:**  
> This system manages **PHYSICAL AUTOMOTIVE HARDWARE & TRANSPONDER BLANKS**, **NOT** cryptographic server secret keys, API credentials, or digital software license tokens.

### Managed Physical Key Types & Hardware Catalog:
* **Transponder Key Blanks**: RFID microchip transponders (Megamos Crypto ID48, Philips Crypto ID46 / PCF7936, Hitag2, 4D63 80-Bit, Texas Crypto).
* **Remote Flip Keys & Keyless FOBs**: 3-button, 4-button, and 5-button smart remote keys (315MHz / 433.92MHz / 868MHz / 902MHz).
* **Mechanical Key Blades**: Edge-cut blades (TR47, B102, H75, FO38) and high-security laser/sidewinder internal track blanks (HU66, HON66, HU100, HU101, VA2, HY22).
* **Locksmith Tools**: Lishi 2-in-1 decoders, OBD2 key programming consoles (Autel IM508/IM608, Xhorse Key Tool Max / KM100), and mini automated CNC cutting machines.

---

## 🚀 Key Functional Capabilities

1. **Client Roadside Intake & Live Geocoding**:
   * Instant roadside customer logging with quick presets (Corolla, Civic, Sentra, F-150, Golf Immo4).
   * Real-time GPS geocoding via OpenStreetMap / Nominatim with technician distance, ETA calculation, and instant links to Google Maps, Waze, Apple Maps, and WhatsApp.
2. **Technician Live Field Notes & Rapid Diagnostic Tags**:
   * Dedicated in-session notes editor with one-tap quick diagnostic tags (`+ Chip ID48 Virgen`, `+ Corte Lishi HU66`, `+ Batería Baja (11.8V)`).
   * Notes automatically sync to client profiles, thermal print receipts, WhatsApp dispatches, and CSV archives.
3. **Hardware Stock Tracking & Low-Stock Alerts**:
   * Barcode/QR code scanner integration via camera.
   * Auto-detection of critically low inventory ($\le 3$ units) with pulsing visual status.
   * **Supplier Replenishment Generator**: Generates formatted wholesale purchase orders with 60% wholesale pricing estimates and single-click WhatsApp vendor ordering.
4. **Hands-Free Spanish Voice Control**:
   * Speech recognition listening for field dispatch commands (`"nuevo cliente"`, `"añadir inventario"`, `"generar pedido"`, `"cobrar"`, `"guía de campo"`).
5. **AI Vehicle Diagnostic & Visual Blade Inspection**:
   * Real-time image capture for immobilizer module and key blade inspection.
   * Built-in interactive field manual covering Lishi pick procedures, OBD2 diagnostic port locations, and BCM-to-PIN code bypasses.
6. **Billing & Thermal Receipt Generation**:
   * Stripe-ready charge modal.
   * Printable 80mm thermal receipt generator and pre-formatted WhatsApp service summary.

---

## 🛠️ Local Development & Quick Start

### Prerequisites
* Node.js v18.0.0 or higher
* npm or bun package manager

### 1. Installation
```bash
# Clone repository
git clone https://github.com/your-org/miami-autokey-erp.git
cd miami-autokey-erp

# Install dependencies
npm install
```

### 2. Environment Variables Configuration
Copy `.env.example` to `.env` (the `.env` file is git-ignored):
```bash
cp .env.example .env
```

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Optional | Google Gemini API Key for server-side AI vehicle & blade diagnostics. |
| `APP_URL` | Optional | Hosted application URL for OAuth callbacks and dispatch links. |

### 3. Run Development Server
```bash
npm run dev
```
The development server will bind to `http://localhost:3000`.

### 4. Build for Production
```bash
npm run build
```
Generates production-ready static assets in the `/dist` directory.

### 5. Type Checking & Verification
```bash
npm run lint
```

---

## 🔒 Security, Validation & Secret Management Guidelines

1. **Zero Secret Leakage**:
   * `.gitignore` explicitly prevents all `.env*` files (except `.env.example`), logs, and credentials from entering version control.
   * Client-side code never accesses private secrets or master database passwords directly.
2. **Form & Data Validation**:
   * Strict client-side validation rules sanitize names, phone numbers, vehicle descriptions, and positive integer stock levels.
   * Local storage data parses safely within `try/catch` fallbacks to ensure zero application crashing if browser cache is corrupted.
3. **Production Deployment Recommendation Checklist**:
   * [ ] Enable HTTPS / SSL on custom domain (mandatory for Web Speech and Camera hardware APIs).
   * [ ] Connect Firebase Authentication / OAuth with Role-Based Access Control (RBAC: Admin, Dispatcher, Field Technician).
   * [ ] Replace local browser storage with Firestore or PostgreSQL for multi-technician real-time synchronization.

---

## 📄 License
MIT License. Created for automotive locksmiths, mobile mechanics, and emergency roadside dispatch teams.
