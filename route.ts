import { NextResponse } from 'next/server';
import { fetchLiveWeather } from '@/lib/weatherApi';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '16.3067');
    const lon = parseFloat(searchParams.get('lon') || '80.4365');
    const city = searchParams.get('city') || undefined;

    const weather = await fetchLiveWeather({
      latitude: lat,
      longitude: lon,
      city,
    });

    return NextResponse.json({ success: true, weather });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Unable to retrieve live weather data.' },
      { status: 500 }
    );
  }
}
