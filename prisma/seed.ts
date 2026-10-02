import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  predictFuelConsumption,
  POPULATION_BASELINE_COEFFICIENTS,
  TripInput,
} from '../src/lib/fuelModel';
import { calibrateVehicleCoefficients, TripRecord } from '../src/lib/regression';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting FuelWise Database Seed...');

  // Clean existing seed data
  await prisma.coefficientSet.deleteMany();
  await prisma.tripLog.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Developer Demo User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@fuelwise.io',
      name: 'Dev Onboarding Demo User',
      passwordHash,
      unitSystem: 'metric',
      currency: 'INR',
      fuelPriceSource: 'manual',
      defaultFuelPrice: 102.5,
    },
  });

  console.log(`👤 Created Demo User: ${user.email} (Password: Password123!)`);

  // 2. Create Vehicle 1: Tata Nexon 1.2 Petrol (has 14 trips -> fully calibrated)
  const nexonM0 = 17.4; // Base mileage 17.4 km/L
  const nexon = await prisma.vehicle.create({
    data: {
      userId: user.id,
      name: 'Tata Nexon 1.2 Revotron',
      make: 'Tata',
      model: 'Nexon XZ+',
      year: 2023,
      fuelType: 'petrol',
      m0: nexonM0,
      ratedPayloadKg: 425.0,
      notes: 'Daily driver with 14 calibrated real-world trips',
    },
  });

  // True driving signature for this specific vehicle + driver:
  const nexonDriverCoeffs = {
    kv: 0.000115,
    kt: 0.36,
    kl: 0.22,
    ka: 0.165,
    kg: 1.55,
    ki: 0.0135,
  };

  const sampleRoutes = [
    { name: 'Western Express Highway Commute', D: 32.5, V: 42, T: 0.65, L: 0.3, A: 0.8, G: 0.005, idle: 12 },
    { name: 'Eastern Freeway Airport Run', D: 45.0, V: 78, T: 0.25, L: 0.5, A: 0.4, G: -0.002, idle: 6 },
    { name: 'Bandra-Worli Sea Link Highway Cruise', D: 28.0, V: 85, T: 0.15, L: 0.2, A: 0.3, G: 0.0, idle: 3 },
    { name: 'City Center Bumper-to-Bumper', D: 18.2, V: 22, T: 0.90, L: 0.4, A: 1.2, G: 0.008, idle: 22 },
    { name: 'Pune Expressway Section', D: 95.0, V: 92, T: 0.20, L: 0.7, A: 0.5, G: 0.018, idle: 8 },
    { name: 'Khandala Ghat Incline Ascent', D: 38.0, V: 48, T: 0.45, L: 0.8, A: 0.9, G: 0.038, idle: 10 },
    { name: 'Navi Mumbai Ring Road', D: 40.5, V: 65, T: 0.35, L: 0.3, A: 0.6, G: 0.0, idle: 7 },
    { name: 'Suburban Grocery & Errand Run', D: 14.0, V: 28, T: 0.70, L: 0.6, A: 1.0, G: -0.005, idle: 15 },
    { name: 'Night Highway Intercity Leg', D: 82.0, V: 88, T: 0.10, L: 0.4, A: 0.2, G: 0.012, idle: 4 },
    { name: 'Rainy Day Rush Hour Sluggish Route', D: 22.0, V: 19, T: 0.95, L: 0.3, A: 1.4, G: 0.004, idle: 26 },
    { name: 'Alibaug Coastal Road', D: 64.0, V: 52, T: 0.40, L: 0.5, A: 0.7, G: 0.010, idle: 9 },
    { name: 'Office Return via SCLR', D: 29.0, V: 34, T: 0.75, L: 0.3, A: 0.9, G: 0.002, idle: 16 },
    { name: 'Early Morning Airport Drop', D: 42.0, V: 72, T: 0.20, L: 0.6, A: 0.4, G: -0.001, idle: 5 },
    { name: 'Weekend Outing to Lonavala', D: 88.0, V: 68, T: 0.38, L: 0.75, A: 0.6, G: 0.024, idle: 11 },
  ];

  const loggedTripRecords: TripRecord[] = [];

  for (let i = 0; i < sampleRoutes.length; i++) {
    const route = sampleRoutes[i];
    const input: TripInput = {
      distanceKm: route.D,
      baseMileageKmPerL: nexonM0,
      avgSpeedKmh: route.V,
      trafficIntensity: route.T,
      loadRatio: route.L,
      aggressiveFactor: route.A,
      gradientDecimal: route.G,
      idleMinutes: route.idle,
    };

    // Calculate baseline prediction (what population baseline would predict)
    const basePred = predictFuelConsumption(input, POPULATION_BASELINE_COEFFICIENTS);

    // True fuel consumption generated from the vehicle physical model + realistic measurement noise (+-1.5%)
    const truePred = predictFuelConsumption(input, nexonDriverCoeffs);
    const noiseFactor = 1 + (Math.sin(i * 1.7) * 0.018); // slight realistic sensor variance
    const actualFuelUsed = Number((truePred.totalFuelLiters * noiseFactor).toFixed(3));

    const hardAccelEvents = Math.round(route.A * route.D * 0.55);
    const hardBrakeEvents = Math.round(route.A * route.D * 0.45);
    const fuelPrice = 102.5;

    const tripDate = new Date(Date.now() - (sampleRoutes.length - i) * 86400000 * 2);

    const tripRow = await prisma.tripLog.create({
      data: {
        vehicleId: nexon.id,
        userId: user.id,
        tripName: route.name,
        origin: 'Mumbai',
        destination: route.name.split(' ')[0],
        distanceKm: route.D,
        fuelUsedLitres: actualFuelUsed,
        predictedFuelLitres: Number(basePred.totalFuelLiters.toFixed(3)),
        avgSpeedKmh: route.V,
        trafficIntensity: route.T,
        loadRatio: route.L,
        hardAccelEvents,
        hardBrakeEvents,
        aggressiveFactor: route.A,
        gradientDecimal: route.G,
        idleMinutes: route.idle,
        fuelPricePerLitre: fuelPrice,
        actualCost: Number((actualFuelUsed * fuelPrice).toFixed(2)),
        predictedCost: Number((basePred.totalFuelLiters * fuelPrice).toFixed(2)),
        dataSource: i % 2 === 0 ? 'manual' : 'gps_live',
        date: tripDate,
      },
    });

    loggedTripRecords.push({
      id: tripRow.id,
      vehicleId: nexon.id,
      distanceKm: route.D,
      fuelUsedLitres: actualFuelUsed,
      avgSpeedKmh: route.V,
      trafficIntensity: route.T,
      loadRatio: route.L,
      hardAccelEvents,
      hardBrakeEvents,
      aggressiveFactor: route.A,
      gradientDecimal: route.G,
      idleMinutes: route.idle,
      createdAt: tripDate,
    });
  }

  // 3. Run ACTUAL OLS Regression on the 14 real database rows!
  const calibrationResult = calibrateVehicleCoefficients(loggedTripRecords, nexonM0, 1);

  if (calibrationResult.canCalibrate && calibrationResult.metrics) {
    await prisma.coefficientSet.create({
      data: {
        vehicleId: nexon.id,
        version: calibrationResult.version,
        kv: calibrationResult.coefficients.kv,
        kt: calibrationResult.coefficients.kt,
        kl: calibrationResult.coefficients.kl,
        ka: calibrationResult.coefficients.ka,
        kg: calibrationResult.coefficients.kg,
        ki: calibrationResult.coefficients.ki,
        isDefault: false,
        sampleSize: calibrationResult.tripsCount,
        rSquared: calibrationResult.metrics.rSquared,
        mae: calibrationResult.metrics.mae,
        mape: calibrationResult.metrics.mape,
        notes: `Calibrated via OLS Multiple Linear Regression from ${calibrationResult.tripsCount} stored trip logs.`,
      },
    });

    console.log('✅ Fitted Real Personal OLS Model for Tata Nexon:');
    console.log(`   R² = ${calibrationResult.metrics.rSquared} | MAE = ${calibrationResult.metrics.mae} L | MAPE = ${calibrationResult.metrics.mape}%`);
  }

  // 4. Create Vehicle 2: Honda City 1.5 i-VTEC (has only 3 trips -> shows uncalibrated state)
  const cityM0 = 18.2;
  const hondaCity = await prisma.vehicle.create({
    data: {
      userId: user.id,
      name: 'Honda City 1.5 i-VTEC',
      make: 'Honda',
      model: 'City ZX',
      year: 2024,
      fuelType: 'petrol',
      m0: cityM0,
      ratedPayloadKg: 400.0,
      notes: 'New vehicle with only 3 logged trips (needs 5 more for calibration)',
    },
  });

  // Default population coefficient set for Honda City
  await prisma.coefficientSet.create({
    data: {
      vehicleId: hondaCity.id,
      version: 1,
      kv: POPULATION_BASELINE_COEFFICIENTS.kv,
      kt: POPULATION_BASELINE_COEFFICIENTS.kt,
      kl: POPULATION_BASELINE_COEFFICIENTS.kl,
      ka: POPULATION_BASELINE_COEFFICIENTS.ka,
      kg: POPULATION_BASELINE_COEFFICIENTS.kg,
      ki: POPULATION_BASELINE_COEFFICIENTS.ki,
      isDefault: true,
      sampleSize: 0,
      notes: 'Population Engineering Baseline. Need 5 more trips before personalized calibration.',
    },
  });

  // Add 3 sample trips for Honda City
  const cityTrips = [
    { name: 'City Dealership to Home', D: 25.0, V: 45, T: 0.5, L: 0.2, A: 0.4, G: 0.0, idle: 8, fuel: 1.75 },
    { name: 'Office Commute First Drive', D: 34.0, V: 55, T: 0.4, L: 0.3, A: 0.5, G: 0.005, idle: 10, fuel: 2.38 },
    { name: 'Weekend Market Shopping', D: 15.0, V: 30, T: 0.7, L: 0.4, A: 0.7, G: 0.0, idle: 14, fuel: 1.26 },
  ];

  for (let i = 0; i < cityTrips.length; i++) {
    const t = cityTrips[i];
    await prisma.tripLog.create({
      data: {
        vehicleId: hondaCity.id,
        userId: user.id,
        tripName: t.name,
        origin: 'Home',
        destination: t.name.split(' ')[0],
        distanceKm: t.D,
        fuelUsedLitres: t.fuel,
        avgSpeedKmh: t.V,
        trafficIntensity: t.T,
        loadRatio: t.L,
        hardAccelEvents: 2,
        hardBrakeEvents: 1,
        aggressiveFactor: t.A,
        gradientDecimal: t.G,
        idleMinutes: t.idle,
        fuelPricePerLitre: 102.5,
        actualCost: Number((t.fuel * 102.5).toFixed(2)),
        dataSource: 'manual',
        date: new Date(Date.now() - (3 - i) * 86400000),
      },
    });
  }

  console.log('✅ Created Honda City with 3 trips (transparent baseline demonstration).');
  console.log('🎉 Seed complete! Dev account ready: demo@fuelwise.io / Password123!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
