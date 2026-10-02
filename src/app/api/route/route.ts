import { NextResponse } from 'next/server';
import { z } from 'zod';
import { calculateRouteDistance, fetchRouteGradient } from '@/lib/dataSources';

const RouteQuerySchema = z.object({
  origin: z.string().min(2, 'Origin location is required'),
  destination: z.string().min(2, 'Destination location is required'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RouteQuerySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      );
    }

    const { origin, destination } = parsed.data;

    // Fetch live OSRM route distance and duration
    const route = await calculateRouteDistance(origin, destination);

    // If route was found with coordinates, sample elevation along route
    let elevation = null;
    if (route.waypoints && route.waypoints.length > 0) {
      elevation = await fetchRouteGradient(route.waypoints);
    }

    return NextResponse.json({
      success: true,
      route,
      elevation: elevation || {
        averageGradientDecimal: 0,
        elevationGainMeters: 0,
        elevationLossMeters: 0,
        source: 'omitted_not_available',
        sourceLabel: 'Gradient Not Available for this Route',
      },
    });
  } catch (err: any) {
    console.error('Routing API error:', err);
    return NextResponse.json(
      { error: 'Failed to calculate route: ' + (err.message || 'Network error') },
      { status: 500 }
    );
  }
}
