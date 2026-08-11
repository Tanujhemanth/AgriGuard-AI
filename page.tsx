'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navbar } from '@/components/Navbar';
import { FieldInputPanel } from '@/components/FieldInputPanel';
import { AiDiagnosisCard } from '@/components/AiDiagnosisCard';
import { LiveWeatherCard } from '@/components/LiveWeatherCard';
import { FarmerAdvisoryCard } from '@/components/FarmerAdvisoryCard';
import { CropHealthRiskDashboard } from '@/components/CropHealthRiskDashboard';
import { FieldMap } from '@/components/FieldMap';
import { ActionTimeline } from '@/components/ActionTimeline';
import { AdvisoryPrintModal } from '@/components/AdvisoryPrintModal';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { CompleteAnalysisReport, ImageFeatures, LocationData, WeatherData, WorkflowState, ImageType } from '@/types';
import { getCurrentBrowserGeolocation } from '@/lib/locationService';
import { fetchLiveWeather } from '@/lib/weatherApi';
import { runLocalObjectDetector } from '@/lib/localDetector';
import {
  MapPin,
  CloudSun,
  CheckCircle2,
  RefreshCw,
  Leaf,
  Compass,
  AlertTriangle,
  Upload,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Home() {
  // Workflow state machine
  const [workflowState, setWorkflowState] = useState<WorkflowState>('LOCATING_FIELD');

  // Device Location State
  const [location, setLocation] = useState<LocationData>({
    latitude: 16.3067,
    longitude: 80.4365,
    village: 'Guntur Rural',
    district: 'Guntur District',
    state: 'Andhra Pradesh',
    country: 'India',
    displayName: 'Guntur Rural, Andhra Pradesh, India',
    isGpsLocked: true,
  });

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [report, setReport] = useState<CompleteAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusNotice, setStatusNotice] = useState<string>('Requesting automatic browser GPS...');
  const [language, setLanguage] = useState<string>('en');
  const [history, setHistory] = useState<CompleteAnalysisReport[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Active Request Tracker for Stale React State Prevention
  const activeRequestIdRef = useRef<string | null>(null);

  // Invalid Non-Crop State
  const [nonCropError, setNonCropError] = useState<{
    image_type: ImageType;
    reason: string;
    isClassificationFailed?: boolean;
  } | null>(null);

  // Auto-Fetch Weather whenever device location changes
  const autoFetchWeatherForLocation = useCallback(async (loc: LocationData) => {
    try {
      setStatusNotice('Syncing live microclimate parameters...');
      const w = await fetchLiveWeather(loc);
      setWeather(w);
      setWorkflowState('WEATHER_SYNCED');
      setStatusNotice(`Device GPS Synced: ${w.currentTempC}°C, ${w.conditionText}`);
    } catch (e) {
      console.warn('Auto weather fetch warning:', e);
      setStatusNotice('Weather sync using regional microclimate fallback.');
    }
  }, []);

  // AUTOMATIC DEVICE GPS DETECTION ON MOUNT
  useEffect(() => {
    let isMounted = true;
    setWorkflowState('LOCATING_FIELD');
    setStatusNotice('Auto-detecting device GPS location...');

    getCurrentBrowserGeolocation()
      .then((gpsLoc) => {
        if (!isMounted) return;
        setLocation(gpsLoc);
        setWorkflowState('GPS_LOCKED');
        setStatusNotice(`Device GPS Auto-Locked: ${gpsLoc.displayName}`);
        autoFetchWeatherForLocation(gpsLoc);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Browser GPS permission denied or unavailable:', err);
        setWorkflowState('GPS_LOCKED');
        setStatusNotice('Device GPS locked to regional coordinates.');
        autoFetchWeatherForLocation(location);
      });

    return () => {
      isMounted = false;
    };
  }, [autoFetchWeatherForLocation]);

  // Load history from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agriguard_history');
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  const saveReportToHistory = (newReport: CompleteAnalysisReport) => {
    try {
      const updated = [newReport, ...history.filter((h) => h.id !== newReport.id)].slice(0, 15);
      setHistory(updated);
      localStorage.setItem('agriguard_history', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleLocationUpdateFromMapOrInput = (newLoc: LocationData) => {
    setLocation(newLoc);
    setWorkflowState('GPS_LOCKED');
    autoFetchWeatherForLocation(newLoc);
  };

  // TWO-LAYER IMAGE ANALYSIS PIPELINE
  const handleAnalyze = async (data: {
    imageUri: string | null;
    location: LocationData;
    imageFeatures?: ImageFeatures;
  }) => {
    if (!data.imageUri) return;

    const currentRequestId = crypto.randomUUID();
    activeRequestIdRef.current = currentRequestId;

    // PREVENT STALE RESULT RETENTION: Clear previous analysis state immediately!
    setReport(null);
    setNonCropError(null);

    setIsLoading(true);
    setWorkflowState('VALIDATING_IMAGE');
    setStatusNotice('🔍 CHECKING IMAGE: Layer 1 Local Person & Object Detector...');

    // LAYER 1: LOCAL PERSON / OBJECT DETECTOR GATE (Client-Side)
    const localGate = await runLocalObjectDetector(data.imageUri, data.imageFeatures?.fileName);

    if (activeRequestIdRef.current !== currentRequestId) return;

    if (!localGate.passed) {
      console.log(`[AI CLASSIFICATION] N/A (Blocked by Layer 1 Gate)`);
      console.log(`[FINAL CLASSIFICATION] NON_CROP`);

      setReport(null);
      setWorkflowState('INVALID_IMAGE');
      setNonCropError({
        image_type: localGate.detectedPerson ? 'human' : 'object',
        reason: localGate.reason || 'Human/person detected. Please upload a clear image of a crop or plant.',
        isClassificationFailed: false,
      });
      setStatusNotice('⚠️ NON-CROP / OBJECT DETECTED');
      setIsLoading(false);
      return;
    }

    // LAYER 2: AGRICULTURAL VISION MODEL API CALL (Server-Side)
    setStatusNotice('🤖 ANALYZING CROP: Layer 2 Agricultural Vision Model...');
    setWorkflowState('AI_ANALYZING');

    try {
      const payloadLocation = data.location || location;

      const res = await fetch('/api/analyze-crop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({
          ...data,
          location: payloadLocation,
          requestId: currentRequestId,
          localDetection: localGate,
        }),
      });

      const json = await res.json();

      if (activeRequestIdRef.current !== currentRequestId) return;

      console.log(`[AI CLASSIFICATION] ${json.classification}`);
      console.log(`[FINAL CLASSIFICATION] ${json.classification}`);

      const isCrop = json.success && json.classification === 'CROP' && json.is_crop_image === true && Boolean(json.report);

      if (!isCrop) {
        setReport(null);
        setWorkflowState('INVALID_IMAGE');
        setNonCropError({
          image_type: json.image_type || 'unknown',
          reason: json.reason || json.message || json.error || 'The uploaded image does not appear to contain an agricultural crop or plant.',
          isClassificationFailed: !json.success,
        });
        setStatusNotice('⚠️ NON-CROP / OBJECT DETECTED');
        return;
      }

      // STATE 1: CROP DETECTED -> Render Crop Analysis
      setReport(json.report);
      setWeather(json.report.weather);
      setWorkflowState('ADVISORY_GENERATED');
      setStatusNotice(`🌾 CROP HEALTH & DISEASE ANALYSIS: ${json.report.aiAnalysis.cropName} • ${json.report.aiAnalysis.conditionName}`);
      saveReportToHistory(json.report);

      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#34d399'],
      });
    } catch (error) {
      if (activeRequestIdRef.current !== currentRequestId) return;
      console.error('Analysis execution error:', error);
      setReport(null);
      setWorkflowState('INVALID_IMAGE');
      setNonCropError({
        image_type: 'unknown',
        reason: 'IMAGE CLASSIFICATION FAILED. Please try another image.',
        isClassificationFailed: true,
      });
      setStatusNotice('⚠️ IMAGE CLASSIFICATION FAILED');
    } finally {
      if (activeRequestIdRef.current === currentRequestId) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-emerald-500 selection:text-emerald-950">
      {/* Top Navbar */}
      <Navbar
        location={location}
        weather={weather}
        language={language}
        onLanguageChange={setLanguage}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
      />

      {/* Automated Progress Banner */}
      <div className="bg-emerald-950/90 border-b border-emerald-500/20 py-2 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Status:</span>
            <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-emerald-200">
              {workflowState === 'LOCATING_FIELD' && <Compass className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
              {workflowState === 'GPS_LOCKED' && <MapPin className="w-3.5 h-3.5 text-amber-400" />}
              {workflowState === 'WEATHER_SYNCED' && <CloudSun className="w-3.5 h-3.5 text-emerald-400" />}
              {workflowState === 'VALIDATING_IMAGE' && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
              {workflowState === 'AI_ANALYZING' && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
              {workflowState === 'INVALID_IMAGE' && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              {workflowState === 'ADVISORY_GENERATED' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{workflowState.replace(/_/g, ' ')}</span>
            </div>
          </div>

          <p className="text-[11px] text-emerald-300/80 font-mono truncate">{statusNotice}</p>
        </div>
      </div>

      {/* Main Streamlined Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step 1: Feature Extraction Scanner + Interactive Field Map */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-8">
            <FieldInputPanel
              onAnalyze={handleAnalyze}
              isLoading={isLoading}
              currentLocation={location}
            />
          </div>
          <div className="lg:col-span-4">
            <FieldMap location={location} onLocationChange={handleLocationUpdateFromMapOrInput} />
          </div>
        </section>

        {/* Loading Spinner */}
        {isLoading && (
          <div className="glass-card p-8 text-center space-y-3 animate-pulse border-2 border-emerald-500/40 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 mx-auto flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
            </div>
            <h3 className="text-base font-extrabold text-white">
              {workflowState === 'VALIDATING_IMAGE'
                ? '🔍 CHECKING IMAGE: Layer 1 Local Person & Object Detector...'
                : '🤖 ANALYZING CROP: Layer 2 Agricultural Vision Model...'}
            </h3>
            <p className="text-xs text-emerald-300/80 max-w-md mx-auto">
              {workflowState === 'VALIDATING_IMAGE'
                ? 'Screening image for human faces, persons, or prohibited objects before agricultural AI processing.'
                : 'Analyzing foliar pathology, crop health score, and microclimate risk parameters.'}
            </p>
          </div>
        )}

        {/* STATE 2 WARNING CARD: NON-CROP / OBJECT DETECTED */}
        {nonCropError && !isLoading && (
          <div className="glass-card p-6 lg:p-8 space-y-4 border-2 border-rose-500/50 bg-rose-950/40 shadow-2xl animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 rounded-full text-xs font-black bg-rose-500 text-white uppercase tracking-wider">
                    {nonCropError.isClassificationFailed ? '⚠️ IMAGE CLASSIFICATION FAILED' : '⚠️ NON-CROP / OBJECT DETECTED'}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">
                  The uploaded image does not appear to contain an agricultural crop or plant.
                </h3>
                <p className="text-xs text-rose-200/90 bg-rose-900/40 p-3 rounded-xl border border-rose-500/30 font-medium">
                  {nonCropError.reason}
                </p>
                <p className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5 pt-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Please upload a clear image of a crop, leaf, stem, fruit, or plant.
                </p>
              </div>
            </div>

            <div className="border-t border-rose-500/20 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setNonCropError(null);
                  setWorkflowState('WEATHER_SYNCED');
                }}
                className="px-5 py-2.5 bg-rose-500 hover:bg-rose-400 text-rose-950 font-black text-xs rounded-xl flex items-center gap-2 shadow-lg"
              >
                <Upload className="w-4 h-4" /> Upload Another Image
              </button>
            </div>
          </div>
        )}

        {/* STATE 1 SUCCESS: CROP DETECTED DASHBOARD (ONLY RENDERED WHEN classification === 'CROP') */}
        {report && !isLoading && !nonCropError && (
          <div id="advisory-section" className="space-y-6 animate-fadeIn">
            {/* CROP DETECTED BADGE */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/40 text-emerald-300 flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 shadow">
                  <Leaf className="w-3.5 h-3.5" /> 🌿 CROP DETECTED
                </span>
                <span className="text-xs font-extrabold text-white">
                  Verified Taxon: {report.aiAnalysis.cropName} ({report.aiAnalysis.botanicalName})
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400/80">
                Confidence: {report.aiAnalysis.confidenceScore}%
              </span>
            </div>

            {/* FARMER ADVISORY CARD */}
            <section>
              <FarmerAdvisoryCard
                advisory={report.advisory}
                onOpenPrintModal={() => setIsPrintModalOpen(true)}
              />
            </section>

            {/* ACTION TIMELINE */}
            <section>
              <ActionTimeline weather={report.weather} advisory={report.advisory} />
            </section>

            {/* COMPUTER VISION DIAGNOSIS */}
            <section>
              <AiDiagnosisCard
                analysis={report.aiAnalysis}
                imageUri={report.input.imageUri}
              />
            </section>

            {/* LIVE WEATHER */}
            <section>
              <LiveWeatherCard weather={report.weather} />
            </section>

            {/* CROP HEALTH & SECURITY RISK DASHBOARD */}
            <section>
              <CropHealthRiskDashboard
                analysis={report.aiAnalysis}
                risk={report.risk}
              />
            </section>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-emerald-500/20 py-4 px-4 text-center text-xs text-emerald-400/60 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-emerald-200">AgriGuard AI — Climate Resilience Platform</span>
          </div>
          <p>© 2026 Hackathon Edition. Decision support for farmer livelihood & food security.</p>
        </div>
      </footer>

      {/* Modals & History Drawer */}
      {isPrintModalOpen && report && (
        <AdvisoryPrintModal
          report={report}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}

      {isHistoryOpen && (
        <HistoryDrawer
          reports={history}
          onSelectReport={(rep) => {
            setReport(rep);
            setLocation(rep.input.location);
          }}
          onClearHistory={() => {
            setHistory([]);
            try {
              localStorage.removeItem('agriguard_history');
            } catch (e) {}
          }}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  );
}
