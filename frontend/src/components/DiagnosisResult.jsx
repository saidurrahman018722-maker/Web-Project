import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Sprout, 
  PlusCircle, 
  ArrowLeft, 
  Droplet, 
  FlaskConical, 
  Info,
  Check,
  Calendar,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function DiagnosisResult({ result, onReset, onSaveToGarden, onNavigateToGarden }) {
  if (!result) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm">
        <p className="text-slate-600 text-sm">No diagnosis result to display.</p>
        <button
          onClick={onReset}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition"
        >
          Return to Scanner
        </button>
      </div>
    );
  }

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customName, setCustomName] = useState(
    result.plant_name ? `${result.plant_name} Plant` : 'My Plant'
  );
  const [wateringInterval, setWateringInterval] = useState(3);
  const [gardenNotes, setGardenNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const diagnosisId = result.diagnosis_id || result.id || null;
  const imageUrl = result.image_url || result.image_path || '/test_samples/sample_leaf.jpg';
  const remedy = result.remedy || {};
  const isHealthy = !!result.is_healthy;
  const rawConfidence = Number(result.confidence) || 0;
  const confidencePercent = Math.round(rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence);

  const handleSaveGarden = async (e) => {
    e.preventDefault();
    setSaveError(null);

    const intervalVal = parseInt(wateringInterval, 10);
    if (isNaN(intervalVal) || intervalVal < 1 || intervalVal > 60) {
      setSaveError('Please enter a valid watering interval between 1 and 60 days.');
      return;
    }

    try {
      setIsSaving(true);
      await api.addPlantToGarden({
        diagnosis_id: diagnosisId,
        custom_name: customName.trim() || `${result.plant_name || 'Garden'} Plant`,
        plant_type: result.plant_name || 'Unknown Species',
        watering_interval_days: intervalVal,
        notes: gardenNotes,
      });

      setIsSaved(true);
      setIsModalOpen(false);
      setSaveSuccessNotice(true);

      if (onSaveToGarden) {
        onSaveToGarden();
      }
    } catch (err) {
      setSaveError(err.response?.data?.error || err.message || 'Failed to save to My Garden');
    } finally {
      setIsSaving(false);
    }
  };

  const handleQuickIntervalSelect = (days) => {
    setWateringInterval(days);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Top Navigation & Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Scan Another Leaf
        </button>

        <div className="flex items-center gap-2">
          {!isSaved ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Add to My Garden
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <Check className="w-4 h-4 text-emerald-600" /> Saved to Garden
              </span>
              {onNavigateToGarden && (
                <button
                  onClick={onNavigateToGarden}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                >
                  View in Garden <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Banner after saving */}
      {saveSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">Plant added to My Garden!</p>
              <p className="text-xs text-emerald-700">
                Care schedules and watering notifications are now actively tracking in your dashboard.
              </p>
            </div>
          </div>
          {onNavigateToGarden && (
            <button
              onClick={onNavigateToGarden}
              className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 transition"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      )}

      {/* Main Result Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Leaf Image Display */}
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-square max-h-60 flex items-center justify-center group">
            <img
              src={imageUrl}
              alt={result.disease_name || result.plant_name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/test_samples/sample_leaf.jpg';
              }}
            />
            <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white">
              Leaf Sample Scan
            </div>
          </div>

          {/* Diagnosis Headline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                {result.plant_name}
              </span>
              
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isHealthy
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {isHealthy ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Healthy Specimen
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Pathology Detected
                  </>
                )}
              </span>

              <span className="text-xs text-slate-400 font-mono ml-auto hidden sm:inline">
                ID: {diagnosisId ? diagnosisId.substring(0, 8) : 'Scan'}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {result.disease_name}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Taxonomic Class: {result.raw_class}
              </p>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI Classification Confidence
                </span>
                <span className={confidencePercent >= 80 ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>
                  {confidencePercent}%
                </span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    confidencePercent >= 80
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500'
                  }`}
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Complete Treatment & Botanical Guidance: 4 Dedicated Pillars */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Treatment & Botanical Care Guide
          </h3>
          <span className="text-xs text-slate-500">
            Expert Agronomic Recommendations
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* 1. Identified Symptoms */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 hover:border-blue-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-inner">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Identified Symptoms</h4>
                <p className="text-[11px] text-slate-400">Pathology & Foliage Indicators</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {remedy.symptoms || (
                isHealthy
                  ? 'No pathogen lesions, chlorosis, or necrotic spots observed. Leaf margins and chlorophyll distribution indicate robust physiological health.'
                  : 'Foliar discoloration, spot lesions, or tissue degradation characteristic of this fungal/bacterial strain.'
              )}
            </p>
          </div>

          {/* 2. Organic Treatment */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 hover:border-emerald-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                <Sprout className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Organic Treatment</h4>
                <p className="text-[11px] text-slate-400">Natural & Biological Controls</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {remedy.organic_treatment || (
                isHealthy
                  ? 'Maintain organic mulch depth, apply rich compost tea every 3-4 weeks, and encourage beneficial soil microbes.'
                  : 'Prune damaged leaves, spray cold-pressed neem oil diluted in water, and introduce predatory insects if pests are present.'
              )}
            </p>
          </div>

          {/* 3. Chemical Controls */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 hover:border-amber-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-inner">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Chemical Controls</h4>
                <p className="text-[11px] text-slate-400">Targeted Formulations & Compounds</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {remedy.chemical_treatment || (
                isHealthy
                  ? 'No synthetic chemicals or fungicides required. Avoid preventative spraying to protect beneficial pollinators.'
                  : 'If symptoms persist, apply copper-based fungicide or chlorothalonil spray following manufacturer label directions.'
              )}
            </p>
          </div>

          {/* 4. Prevention & Agronomic Practices */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3 hover:border-indigo-200 transition">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-inner">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Prevention & Long-term Care</h4>
                <p className="text-[11px] text-slate-400">Proactive Cultural Practices</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed pt-1">
              {remedy.prevention || (
                'Water at the base of the plant to keep foliage dry, provide proper plant spacing for airflow, and rotate crops annually.'
              )}
            </p>
          </div>

        </div>
      </div>

      {/* Top Candidates Breakdown from MobileNetV2 */}
      {result.top_candidates && result.top_candidates.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              PyTorch Confidence Breakdown (Top Candidates)
            </h4>
            <span className="text-xs font-mono text-slate-400">
              MobileNetV2 Softmax Distribution
            </span>
          </div>

          <div className="space-y-3">
            {result.top_candidates.map((cand, idx) => {
              const rawCandConf = Number(cand?.confidence) || 0;
              const candConfidence = Math.round(rawCandConf <= 1 ? rawCandConf * 100 : rawCandConf);
              const isFirst = idx === 0;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    isFirst ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isFirst
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        #{idx + 1} Match
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {cand.plant_name} — {cand.disease_name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {candConfidence}%
                      </span>
                      {cand.is_healthy ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Healthy
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                          Disease
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isFirst ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                      style={{ width: `${candConfidence}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Add to My Garden */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
                Add to My Garden
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-base transition"
              >
                &times;
              </button>
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveGarden} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Plant Nickname
                </label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Backyard Tomato, Kitchen Basil"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Botanical Species
                </label>
                <div className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-700 font-semibold flex items-center justify-between">
                  <span>{result.plant_name || 'Crop'}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">
                    Detected
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-blue-500" /> Watering Interval (Days)
                </label>
                <div className="flex gap-1.5 mb-2">
                  {[1, 2, 3, 5, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => handleQuickIntervalSelect(days)}
                      className={`flex-1 py-1 text-xs font-semibold rounded-lg border transition ${
                        wateringInterval === days
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="1"
                  max="60"
                  required
                  value={wateringInterval}
                  onChange={(e) => setWateringInterval(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  PlantDoc will trigger watering alerts every {wateringInterval || 0} day(s).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Care Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={gardenNotes}
                  onChange={(e) => setGardenNotes(e.target.value)}
                  placeholder="e.g. Sunlight requirements, soil mix, fertilizer schedule..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Confirm & Track'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
