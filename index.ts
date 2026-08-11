export type WorkflowState =
  | 'LOCATING_FIELD'
  | 'GPS_LOCKED'
  | 'WEATHER_SYNCED'
  | 'IMAGE_READY'
  | 'VALIDATING_IMAGE'
  | 'AI_ANALYZING'
  | 'INVALID_IMAGE'
  | 'FIELD_INTELLIGENCE_READY'
  | 'ADVISORY_GENERATED';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  village?: string;
  district?: string;
  state?: string;
  country?: string;
  city?: string;
  region?: string;
  displayName?: string;
  isGpsLocked?: boolean;
  isCustom?: boolean;
  lastUpdated?: string;
}

export interface HourlyForecast {
  time: string;
  hourLabel: string;
  tempC: number;
  humidityPct: number;
  rainProb: number;
  precipMm: number;
  windSpeedKmH: number;
  windDirection?: string;
  condition: string;
  isSafeForSpraying: boolean;
  spraySafetyReason: string;
}

export interface WeatherData {
  currentTempC: number;
  humidityPct: number;
  precipitationMm: number;
  rainProbabilityPct: number;
  windSpeedKmH: number;
  windDirection: string;
  conditionText: string;
  uvIndex: number;
  locationName: string;
  hourlyForecast: HourlyForecast[];
  next24hPrecipTotalMm: number;
  maxWindSpeed24h: number;
  isRainExpectedSoon: boolean;
  isHighWindExpected: boolean;
  isLive: boolean;
  lastFetchedAt: string;
  nextRainEvent: { timeLabel: string; prob: number; precipMm: number } | null;
  highHumidityPeriod: { timeLabel: string; humidity: number } | null;
  suitableWindow: { timeWindow: string; reason: string } | null;
}

export type PathogenType =
  | 'Fungal'
  | 'Bacterial'
  | 'Viral'
  | 'Pest'
  | 'Nutrient Deficiency'
  | 'Environmental Stress'
  | 'Healthy'
  | 'Unclear Image'
  | 'Non-Crop Image';

export type ClassificationType = 'CROP' | 'NON_CROP';

export type ImageType =
  | 'plant'
  | 'leaf'
  | 'fruit'
  | 'stem'
  | 'human'
  | 'animal'
  | 'object'
  | 'document'
  | 'vehicle'
  | 'building'
  | 'landscape'
  | 'unknown';

export interface ImageFeatures {
  fileName?: string;
  greenPct?: number;
  yellowPct?: number;
  exgLeafPct?: number;
  brownPct?: number;
  darkPct?: number;
  skinTonePct?: number;
  aspectRatio?: number;
  luminance?: number;
  variance?: number;
}

export interface AiCropAnalysis {
  classification: ClassificationType;
  is_crop_image: boolean;
  image_type: ImageType;
  cropName: string | null;
  botanicalName?: string | null;
  leafArchitecture?: string | null;
  conditionName: string | null;
  pathogenType: PathogenType;
  confidenceScore: number; // 0 to 100
  severityPct: number; // 0 to 100
  visibleSymptoms: string[];
  visible_damage: string;
  cropHealthScore: number; // 0 to 100
  visualQualityScore: number; // 0 to 100
  visualQualityObservations: string[];
  exactVerificationCriteria?: string[];
  healthBreakdown: {
    diseaseImpact: number;
    visibleDamage: number;
    environmentalStress: number;
  };
  lesionHighlights: { x: number; y: number; width: number; height: number; label: string }[];
  isAiDerivedEstimate: boolean;
  isUnclearImage: boolean;
  unclearReason?: string;
  disease_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | null;
  pest_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | null;
  analysis_notes: string;
}

export type ActionStatus = 'ACT_NOW' | 'WAIT' | 'MONITOR' | 'REASSESS';

export interface DecisionEngineOutput {
  action_status: ActionStatus;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW';
  statusBadge: {
    label: string;
    color: 'green' | 'amber' | 'blue' | 'red';
    iconText: string;
  };
  primary_risk: string;
  whatsWrong: {
    crop: string;
    condition: string;
    pathogenType: PathogenType;
    confidence: number;
    severity: number;
    severityLabel: 'LIGHT' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
    mainVisibleSymptoms: string[];
  };
  treatment_guidance: {
    summary: string;
    organic: string[];
    chemical: string[];
    ppe: string[];
    followProductLabelNotice: string;
  };
  timing_guidance: {
    recommendation: string;
    suggestedTimeWindow: string;
    weatherFactors: string[];
  };
  reasons: string[];
  confidence: number;
  warnings: string[];
  weatherRiskExplanation: string;
}

export interface FieldContext {
  location: LocationData;
  crop_analysis: AiCropAnalysis;
  current_weather: WeatherData;
  forecast: HourlyForecast[];
}

export interface CropSecurityRisk {
  diseaseRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  pestRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  climateRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  waterStressRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  overallRiskScore: number;
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  primaryRiskFactor: string;
}

export interface CompleteAnalysisReport {
  id: string;
  timestamp: string;
  input: {
    imageUri: string | null;
    cropName: string;
    location: LocationData;
  };
  fieldContext: FieldContext;
  aiAnalysis: AiCropAnalysis;
  weather: WeatherData;
  advisory: DecisionEngineOutput;
  risk: CropSecurityRisk;
}

export interface PresetSample {
  id: string;
  title: string;
  crop: string;
  disease: string;
  thumbnail: string;
  severity: number;
  description: string;
  defaultLocation: LocationData;
}
