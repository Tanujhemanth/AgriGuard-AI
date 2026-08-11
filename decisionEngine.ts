import {
  AiCropAnalysis,
  WeatherData,
  FieldContext,
  DecisionEngineOutput,
  ActionStatus,
  PathogenType,
} from '@/types';

export function runAgronomicDecisionEngine(fieldContext: FieldContext): DecisionEngineOutput {
  const { crop_analysis, current_weather, forecast } = fieldContext;
  const { severityPct, confidenceScore, pathogenType, isUnclearImage } = crop_analysis;
  const cropName = crop_analysis.cropName || 'Crop';
  const conditionName = crop_analysis.conditionName || 'Pathology';

  const {
    currentTempC,
    humidityPct,
    rainProbabilityPct,
    windSpeedKmH,
    isRainExpectedSoon,
    nextRainEvent,
  } = current_weather;

  const reasons: string[] = [];
  const weatherFactors: string[] = [];
  const warnings: string[] = [];
  let action_status: ActionStatus = 'ACT_NOW';
  let urgency: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

  // Step 1: Unclear image check
  if (isUnclearImage || confidenceScore < 40) {
    action_status = 'REASSESS';
    urgency = 'LOW';
    reasons.push(
      `Image clarity or AI confidence is low (${confidenceScore}%). Re-scan foliage under daylight before applying any treatments.`
    );
    warnings.push('Do not spray chemical treatments without a verified high-confidence pathology diagnosis.');
  }

  // Step 2: Healthy Crop Check
  if (pathogenType === 'Healthy' || (conditionName.toLowerCase().includes('healthy') && severityPct < 15)) {
    action_status = 'MONITOR';
    urgency = 'LOW';
    reasons.push('Foliar symptoms indicate healthy foliage with minimal pathogen pressure. Continue routine monitoring.');
  }

  // Step 3: Weather Rules Evaluation
  const next4HoursRainProb = Math.max(...forecast.slice(0, 4).map((h) => h.rainProb));
  const maxWindNext4h = Math.max(...forecast.slice(0, 4).map((h) => h.windSpeedKmH));

  // Rain Wash-off Hazard
  if (isRainExpectedSoon || next4HoursRainProb >= 45 || rainProbabilityPct >= 50) {
    action_status = 'WAIT';
    urgency = 'HIGH';
    const rainTime = nextRainEvent ? ` (expected at ${nextRainEvent.timeLabel}, ${nextRainEvent.prob}% prob)` : '';
    weatherFactors.push(`Imminent rainfall risk${rainTime}.`);
    reasons.push(
      `Rain probability is high (${next4HoursRainProb}%)${rainTime}. Applying treatments now risks immediate rainfall wash-off, destroying chemical efficacy and contaminating runoff.`
    );
    warnings.push('Rainfall within 4-6 hours post-application renders non-systemic foliar sprays ineffective.');
  }

  // Wind Drift Hazard
  if (windSpeedKmH > 15 || maxWindNext4h >= 18) {
    action_status = 'WAIT';
    if (urgency !== 'HIGH') urgency = 'MEDIUM';
    weatherFactors.push(`Wind speed (${windSpeedKmH} km/h, gusts up to ${maxWindNext4h} km/h) exceeds 15 km/h limit.`);
    reasons.push(
      `Wind speed (${windSpeedKmH} km/h) exceeds safe spraying threshold (15 km/h). Excessive wind causes spray droplet drift onto neighboring non-target crops.`
    );
    warnings.push('Drift risk: Spraying under strong winds violates pesticide label safety regulations.');
  }

  // Heat Evaporation & Phytotoxicity Hazard
  if (currentTempC > 32) {
    if (action_status !== 'WAIT') {
      action_status = 'MONITOR';
      urgency = 'MEDIUM';
    }
    weatherFactors.push(`High ambient temperature (${currentTempC}°C).`);
    reasons.push(
      `High ambient temperature (${currentTempC}°C) causes rapid spray droplet evaporation and increases leaf scorching (phytotoxicity) risk.`
    );
  }

  // Humidity Fungal Risk Factor
  if (humidityPct >= 75 && pathogenType === 'Fungal') {
    weatherFactors.push(`High relative humidity (${humidityPct}%) favors fungal spore germination.`);
    reasons.push(
      `Relative humidity (${humidityPct}%) creates optimal microclimate for fungal spore propagation. Treatment timing is critical once rain clears.`
    );
  }

  // Step 4: Primary Risk & Severity Labeling
  let severityLabel: 'LIGHT' | 'MODERATE' | 'SEVERE' | 'CRITICAL' = 'LIGHT';
  if (severityPct > 75) severityLabel = 'CRITICAL';
  else if (severityPct > 50) severityLabel = 'SEVERE';
  else if (severityPct > 25) severityLabel = 'MODERATE';

  let primary_risk = 'Active Foliar Disease Symptoms';
  if (action_status === 'WAIT' && (isRainExpectedSoon || next4HoursRainProb >= 45)) {
    primary_risk = 'Rainfall Wash-Off & Pesticide Inefficacy';
  } else if (action_status === 'WAIT' && windSpeedKmH > 15) {
    primary_risk = 'Airborne Spray Drift to Non-Target Vegetation';
  }

  // Step 5: Suggested Time Window
  const safeHours = forecast.filter((h) => h.isSafeForSpraying);
  let suggestedTimeWindow = 'Within the next 2-3 hours (Morning / Late Afternoon)';
  let recommendationText = '🟢 CONDITIONS FAVORABLE: Atmospheric parameters permit safe, high-efficacy foliar application.';

  if (action_status === 'WAIT') {
    if (safeHours.length > 0) {
      const firstSafe = safeHours[0];
      suggestedTimeWindow = `Wait until ${firstSafe.hourLabel} when weather settles (${firstSafe.tempC}°C, Wind ${firstSafe.windSpeedKmH} km/h, Rain ${firstSafe.rainProb}%).`;
    } else {
      suggestedTimeWindow = 'Wait 12-24 hours for rain front to pass and wind to drop below 15 km/h.';
    }
    recommendationText = '🔴 WAIT: Postpone spraying due to imminent weather wash-off or wind drift hazards.';
  } else if (action_status === 'MONITOR' || action_status === 'REASSESS') {
    suggestedTimeWindow = 'Re-inspect foliage in 24-48 hours; capture a new clear photo if lesions expand.';
    recommendationText = '🟠 MONITOR / REASSESS: Chemical application is currently unwarranted. Focus on cultural field sanitation.';
  }

  // Status Badge Formatting
  const getBadge = () => {
    switch (action_status) {
      case 'ACT_NOW':
        return { label: 'CONDITIONS FAVORABLE (ACT NOW)', color: 'green' as const, iconText: '🟢' };
      case 'WAIT':
        return { label: 'WAIT & POSTPONE SPRAY', color: 'amber' as const, iconText: '🔴' };
      case 'MONITOR':
        return { label: 'MONITOR & CULTURAL CONTROL', color: 'blue' as const, iconText: '🟠' };
      default:
        return { label: 'REASSESS WITH CLEAR PHOTO', color: 'red' as const, iconText: '⚠️' };
    }
  };

  const statusBadge = getBadge();

  // Weather Risk Explanation
  let weatherRiskExplanation = 'Current weather signals (low wind drift, low rain risk) support effective treatment absorption.';
  if (action_status === 'WAIT') {
    weatherRiskExplanation = `Weather parameters (${currentTempC}°C, ${humidityPct}% humidity, ${windSpeedKmH} km/h wind) present active wash-off or drift hazards. Postponing until the recommended window ensures chemical retention and safety.`;
  }

  return {
    action_status,
    urgency,
    statusBadge,
    primary_risk,
    whatsWrong: {
      crop: cropName,
      condition: conditionName,
      pathogenType,
      confidence: confidenceScore,
      severity: severityPct,
      severityLabel,
      mainVisibleSymptoms: crop_analysis.visibleSymptoms,
    },
    treatment_guidance: {
      summary: `Agronomic guidance for ${conditionName} on ${cropName}: Combine field sanitation with recommended protective applications.`,
      organic: getOrganicActions(pathogenType, cropName),
      chemical: getChemicalActions(pathogenType, cropName),
      ppe: [
        'Wear protective goggles, chemical-resistant nitrile gloves, and an N95 respirator mask.',
        'Do not spray against prevailing wind direction.',
        'Keep livestock and children out of the treated zone for at least 24 hours.',
        'Wash hands and spray apparatus thoroughly after application.',
      ],
      followProductLabelNotice:
        'IMPORTANT NOTICE: This advisory is for decision support. Always strictly read and follow manufacturer product labels, dosage instructions, and local government agricultural extension guidelines.',
    },
    timing_guidance: {
      recommendation: recommendationText,
      suggestedTimeWindow,
      weatherFactors: weatherFactors.length > 0 ? weatherFactors : ['Calm wind (<15 km/h)', 'Low rain probability (<20%)'],
    },
    reasons,
    confidence: confidenceScore,
    warnings,
    weatherRiskExplanation,
  };
}

function getOrganicActions(pathogenType: PathogenType, crop: string): string[] {
  switch (pathogenType) {
    case 'Fungal':
      return [
        `Prune and safely discard infected lower foliage of ${crop} to reduce fungal spore loads.`,
        'Apply bio-fungicide (Trichoderma viride or Bacillus subtilis) at 5g/L water.',
        'Spray cold-pressed Neem Oil (10,000 ppm) diluted with mild soap (5ml/L) as a protective barrier.',
        'Improve row spacing and weed control to promote canopy air ventilation.',
      ];
    case 'Bacterial':
      return [
        `Remove and burn/bury severely damaged ${crop} foliage away from healthy rows.`,
        'Apply copper hydroxide or copper oxychloride bio-spray.',
        'Switch from overhead sprinkler irrigation to ground drip lines to prevent leaf wetness.',
        'Rotate with non-host crops (legumes or cereals) next planting cycle.',
      ];
    case 'Pest':
      return [
        'Release beneficial predatory insects (ladybugs, lacewings, or parasitic wasps).',
        'Install yellow sticky cards (10 per acre) to monitor and trap adult insect vectors.',
        'Apply Neem-based EC formulation (1500 ppm) early morning.',
      ];
    default:
      return [
        'Apply well-cured compost or vermicompost around root drip lines.',
        'Maintain balanced soil moisture without waterlogging.',
        'Foliar spray seaweed extract to boost plant stress resistance.',
      ];
  }
}

function getChemicalActions(pathogenType: PathogenType, crop: string): string[] {
  switch (pathogenType) {
    case 'Fungal':
      return [
        `Foliar spray of Azoxystrobin 18.2% + Difenoconazole 11.4% SC at 1 ml/liter water.`,
        `Alternative broad-spectrum contact: Mancozeb 75% WP at 2.5 g/liter water.`,
        `Observe mandatory 7-day Pre-Harvest Interval (PHI) before harvesting ${crop}.`,
      ];
    case 'Bacterial':
      return [
        `Foliar spray of Streptomycin Sulphate + Tetracycline Hydrochloride mixture at 0.5 g/liter water.`,
        `Combine with Copper Oxychloride 50% WP at 2 g/liter water for synergistic bactericidal action.`,
        `Observe minimum 14-day Pre-Harvest Interval (PHI) prior to crop harvest.`,
      ];
    case 'Pest':
      return [
        `Apply Emamectin Benzoate 5% SG at 0.4 g/liter water targeting under-leaf foliage.`,
        `Observe 5-day Pre-Harvest Interval (PHI) before picking produce.`,
      ];
    default:
      return [
        `Foliar spray of NPK 19:19:19 water-soluble fertilizer at 5 g/liter water to address nutrient stress.`,
      ];
  }
}
