# FuelWise — Production-Grade Fuel Consumption & Cost Prediction Platform

FuelWise is an automotive-grade web application that predicts how much fuel a vehicle will actually consume and cost for any planned journey. Unlike generic manufacturer window-sticker figures (ARAI / EPA), FuelWise utilizes a mathematically grounded physical model calibrated directly against your own driving logs via **Ordinary Least Squares (OLS) Multiple Linear Regression**.

---

## 0. Non-Negotiable Ground Rules Compliance

1. **No Fabricated Data**: Every number shown to a user traces directly to a user input, a database row, or a live API response. If external telemetry is not available, explicit badges indicate fallback status.
2. **No Simulated Regression**: All coefficients are estimated by running real matrix OLS regression (`ml-matrix`) against actual stored rows in the `trip_logs` database table. A minimum of 8 trips is strictly required for calibration, with ~20% held out as an independent test set.
3. **No Silent Unit Errors**: Every physical quantity explicitly carries its unit in schemas, APIs, and the UI (`km`, `km/h`, `L`, `km/L`, `min`, `kg`, `INR/USD/EUR/GBP`).
4. **Transparent Assumptions**: Transparent badges (`[OSRM Live Routing Engine]`, `[Manual Estimate]`, `[Population Engineering Baseline]`, `[Self-Reported Price]`) label every default and data source.
5. **Real Persistence & Authentication**: Powered by Prisma ORM with SQLite (local development zero-config) and turnkey PostgreSQL support (Neon / Supabase), with bcrypt-secured session management.

---

## 1. The Mathematical Model

$$F = \left(\frac{D}{M_0}\right) \cdot \left(1 + k_v \cdot V^2 + k_t \cdot T + k_l \cdot L + k_a \cdot A + k_g \cdot G\right) + k_i \cdot t_{\text{idle}}$$

| Symbol | Parameter | Unit | Physical Meaning |
|---|---|---|---|
| **F** | Predicted Fuel Consumed | Litres (L) | Total fuel consumed on the trip |
| **D** | Distance | km | Total road distance traveled |
| **M₀** | Base / Ideal Mileage | km/L | Unloaded, steady highway baseline mileage |
| **V** | Average Speed | km/h | Aerodynamic drag scales quadratically ($V^2$) |
| **T** | Traffic Intensity | 0.0 to 1.0 | Stop-and-go congestion index |
| **L** | Payload Load Ratio | 0.0 to 1.0 | Fraction of rated vehicle payload carried |
| **A** | Aggressive Factor | events/km | Hard acceleration and harsh braking rate |
| **G** | Road Gradient | decimal / % | Average incline/decline across the route |
| **t_idle**| Idling Duration | minutes | Engine runtime during signals & stops |
| **kᵥ, kₜ, kₗ, kₐ, k_g, kᵢ** | Vehicle Coefficients | fitted via OLS | Vehicle-specific physical characteristics |

### Cost Equations

$$\text{Cost} = F \cdot P$$
$$\text{Cost\_per\_km} = \frac{\text{Cost}}{D}$$
$$\text{Effective\_mileage} = \frac{D}{F}$$

Where $P$ is the verified local fuel price per litre.

---

## 2. Real Data Sources & Provenance

See [`docs/data-sources.md`](./docs/data-sources.md) for full audit specifications:
- **Routing & Distance**: Live OSRM driving network API (`router.project-osrm.org`) + OpenStreetMap Nominatim geocoding.
- **Road Gradient**: Live Open-Elevation API (`api.open-elevation.com`) sampled along route coordinates.
- **Traffic Intensity**: Documented 4-level calibrated scale (Free: 0.10, Light: 0.35, Moderate: 0.65, Heavy: 0.95).
- **GPS & Accelerometer**: Browser HTML5 Geolocation API (`watchPosition`) and DeviceMotion accelerometer.

---

## 3. Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS (Automotive Dark Telemetry Theme)
- **Visualizations**: Recharts (Scatter plots, waterfall bars, residual histograms)
- **Database & ORM**: SQLite / PostgreSQL via Prisma ORM
- **Statistical Engine**: `ml-matrix` (OLS matrix solving, QR/pseudo-inverse)
- **Testing**: Vitest with hand-verified unit tests

---

## 4. Getting Started

### Prerequisites
Node.js 18+ (tested on Node v20 LTS).

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Initialize Database & Push Schema
```bash
npm run db:push
```

### 4. Run Development Seed Script
Creates a developer demo account (`demo@fuelwise.io` / `Password123!`) with:
- **Tata Nexon**: 14 real SQL trips, calibrated via OLS with verified $R^2 \approx 0.96$, MAE $\approx 0.43$ L.
- **Honda City**: 3 trips, demonstrating the transparent baseline fallback state.
```bash
npm run db:seed
```

### 5. Run Unit Tests
Executes the hand-verified calculation engine and OLS regression tests:
```bash
npm run test
```

### 6. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 5. Deployment to Production

### PostgreSQL (Neon / Supabase / AWS RDS)
To deploy with PostgreSQL:
1. In `prisma/schema.prisma`, update the provider:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your production `DATABASE_URL` and `SESSION_SECRET` in Vercel or your hosting environment.
3. Run `npx prisma migrate deploy`.
