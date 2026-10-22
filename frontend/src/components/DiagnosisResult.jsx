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
  Calendar
} from 'lucide-react';
import { api } from '../services/api';

export default function DiagnosisResult({ result, onReset, onSaveToGarden }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customName, setCustomName] = useState(`${result.plant_name} Plant`);
  const [wateringInterval, setWateringInterval] = useState(3);
  const [gardenNotes, setGardenNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const remedy = result.remedy || {};
  const isHealthy = result.is_healthy;
  const confidencePercent = Math.round(result.confidence * 100);

  const handleSaveGarden = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.addPlantToGarden({
        diagnosis_id: result.diagnosis_id,
        custom_name: customName,
        plant_type: result.plant_name,
        watering_interval_days: parseInt(wateringInterval, 10),
        notes: gardenNotes,
      });
      setIsSaved(true);
      setIsModalOpen(false);
      if (onSaveToGarden) {
        onSaveToGarden();
      }
    } catch (err) {
      alert('Failed to save to My Garden: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-emerald-700 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Scan Another Leaf
        </button>

        {!isSaved ? (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" /> Add to My Garden
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600" /> Saved to Garden
          </span>
        )}
      </div>

      {/* Main Result Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Leaf Image Display */}
          <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-200 aspect-square max-h-56 flex items-center justify-center">
            <img
              src={result.image_url}
              alt={result.disease_name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/test_samples/sample_leaf.jpg';
              }}
            />
          </div>

          {/* Diagnosis Headline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
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
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Healthy Plant
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Disease Detected
                  </>
                )}
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {result.disease_name}
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Class Tag: {result.raw_class}
              </p>
            </div>

            {/* Confidence Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Model Confidence</span>
                <span className="text-emerald-700">{confidencePercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Biological Remedies & Action Guides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Symptoms */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Info className="w-4 h-4" />
            </div>
            <h3>Identified Symptoms</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {remedy.symptoms || 'No specific visual lesions noted. Foliage demonstrates healthy cellular structure and even pigment.'}
          </p>
        </div>

        {/* Organic Remedies */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <h3>Organic Treatment</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {remedy.organic_treatment || 'Maintain adequate soil compost, mulching, and natural beneficial insect populations.'}
          </p>
        </div>

        {/* Chemical / Professional Options */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <FlaskConical className="w-4 h-4" />
            </div>
            <h3>Chemical & Preventive</h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {remedy.chemical_treatment || remedy.prevention || 'Standard fungicide or targeted pesticide formulations as needed for persistent infestation.'}
          </p>
        </div>

      </div>

      {/* Top-3 Candidates Breakdown */}
      {result.top_candidates && result.top_candidates.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            PyTorch Confidence Breakdown (Top Predictions)
          </h4>
          <div className="space-y-3">
            {result.top_candidates.map((cand, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{cand.plant_name} — {cand.disease_name}</span>
                  <span className="font-mono">{Math.round(cand.confidence * 100)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${idx === 0 ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    style={{ width: `${Math.round(cand.confidence * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add to My Garden */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <Sprout className="w-5 h-5 text-emerald-600" /> Add to My Garden
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                &times;
              </button>
            </div>

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
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1 flex items-center gap-1.5">
                  <Droplet className="w-3.5 h-3.5 text-blue-500" /> Watering Interval (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  required
                  value={wateringInterval}
                  onChange={(e) => setWateringInterval(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Care Notes
                </label>
                <textarea
                  rows="2"
                  value={gardenNotes}
                  onChange={(e) => setGardenNotes(e.target.value)}
                  placeholder="e.g. Needs morning sun, water every 3 days"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Confirm & Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
