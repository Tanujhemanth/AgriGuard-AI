import { AiCropAnalysis, WeatherData, CropSecurityRisk } from '@/types';

export function computeCropSecurityRisk(
  analysis: AiCropAnalysis,
  weather: WeatherData
): CropSecurityRisk {
  const { severityPct, pathogenType, cropHealthScore } = analysis;
  const { humidityPct, rainProbabilityPct, windSpeedKmH, currentTempC } = weather;

  // Disease Risk calculation
  let diseaseRiskNum = severityPct * 0.7 + (humidityPct > 70 ? 20 : 5);
  if (pathogenType === 'Fungal' || pathogenType === 'Bacterial') diseaseRiskNum += 10;
  diseaseRiskNum = Math.min(100, Math.max(0, diseaseRiskNum));

  let diseaseRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (diseaseRiskNum > 75) diseaseRisk = 'CRITICAL';
  else if (diseaseRiskNum > 50) diseaseRisk = 'HIGH';
  else if (diseaseRiskNum > 25) diseaseRisk = 'MODERATE';

  // Pest Risk calculation
  let pestRiskNum = 15;
  if (pathogenType === 'Pest') pestRiskNum += 60;
  if (currentTempC > 28 && humidityPct < 60) pestRiskNum += 15; // warm dry conditions favor mites/thrips
  pestRiskNum = Math.min(100, Math.max(0, pestRiskNum));

  let pestRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (pestRiskNum > 75) pestRisk = 'CRITICAL';
  else if (pestRiskNum > 50) pestRisk = 'HIGH';
  else if (pestRiskNum > 25) pestRisk = 'MODERATE';

  // Climate / Weather Risk calculation
  let climateRiskNum = 10;
  if (rainProbabilityPct > 60) climateRiskNum += 35;
  if (windSpeedKmH > 16) climateRiskNum += 25;
  if (currentTempC > 32 || currentTempC < 12) climateRiskNum += 20;
  if (humidityPct > 85) climateRiskNum += 15;
  climateRiskNum = Math.min(100, Math.max(0, climateRiskNum));

  let climateRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (climateRiskNum > 75) climateRisk = 'CRITICAL';
  else if (climateRiskNum > 50) climateRisk = 'HIGH';
  else if (climateRiskNum > 25) climateRisk = 'MODERATE';

  // Water Stress Risk calculation
  let waterStressNum = 15;
  if (weather.precipitationMm < 0.1 && humidityPct < 45 && currentTempC > 30) {
    waterStressNum = 70;
  } else if (rainProbabilityPct > 70 || weather.precipitationMm > 10) {
    waterStressNum = 35; // potential waterlogging risk
  }
  waterStressNum = Math.min(100, Math.max(0, waterStressNum));

  let waterStressRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (waterStressNum > 75) waterStressRisk = 'CRITICAL';
  else if (waterStressNum > 50) waterStressRisk = 'HIGH';
  else if (waterStressNum > 25) waterStressRisk = 'MODERATE';

  // Overall Agricultural Risk Score (0 - 100)
  const overallRiskScore = Math.round(
    diseaseRiskNum * 0.45 + climateRiskNum * 0.3 + pestRiskNum * 0.15 + waterStressNum * 0.1
  );

  let overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'LOW';
  if (overallRiskScore > 75) overallRiskLevel = 'CRITICAL';
  else if (overallRiskScore > 50) overallRiskLevel = 'HIGH';
  else if (overallRiskScore > 25) overallRiskLevel = 'MODERATE';

  // Primary Contributing Risk Factor
  let primaryRiskFactor = 'Active Foliar Disease Symptoms';
  if (climateRiskNum > diseaseRiskNum && climateRiskNum > pestRiskNum) {
    primaryRiskFactor = 'Adverse Meteorological Conditions (Rain / Wind Drift)';
  } else if (pestRiskNum > diseaseRiskNum) {
    primaryRiskFactor = 'Insect & Vector Pest Pressure';
  } else if (waterStressNum > 60) {
    primaryRiskFactor = 'Extreme Drought / Water Stress';
  }

  return {
    diseaseRisk,
    pestRisk,
    climateRisk,
    waterStressRisk,
    overallRiskScore,
    overallRiskLevel,
    primaryRiskFactor,
  };
}
