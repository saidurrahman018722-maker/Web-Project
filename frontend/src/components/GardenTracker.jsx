import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sprout, 
  Droplet, 
  Calendar, 
  Clock, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  Search, 
  RefreshCw, 
  Leaf, 
  AlertCircle,
  Check,
  Info
} from 'lucide-react';
import { api } from '../services/api';

// Compute dynamic care status based on next_water_due date
export function computeCareStatus(nextWaterDueStr) {
  if (!nextWaterDueStr) {
    return {
      key: 'on_track',
      label: 'On Track',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dotClass: 'bg-emerald-500',
      textClass: 'text-slate-800',
      description: 'Care on track',
      diffDays: 999,
    };
  }

  const now = new Date();
  const due = new Date(nextWaterDueStr);
  if (isNaN(due.getTime())) {
    return {
      key: 'on_track',
      label: 'On Track',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dotClass: 'bg-emerald-500',
      textClass: 'text-slate-800',
      description: 'Care on track',
      diffDays: 999,
    };
  }

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDate = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  const diffTime = dueDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const late = Math.abs(diffDays);
    return {
      key: 'overdue',
      label: 'Overdue',
      badgeClass: 'bg-red-100 text-red-800 border-red-300',
      dotClass: 'bg-red-500',
      textClass: 'text-red-600',
      description: `${late} day${late > 1 ? 's' : ''} overdue`,
      diffDays,
    };
  } else if (diffDays === 0) {
    return {
      key: 'due_today',
      label: 'Due Today',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      dotClass: 'bg-amber-500',
      textClass: 'text-amber-600',
      description: 'Needs water today',
      diffDays,
    };
  } else {
    return {
      key: 'on_track',
      label: 'On Track',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dotClass: 'bg-emerald-500',
      textClass: 'text-slate-800',
      description: `Water in ${diffDays} day${diffDays > 1 ? 's' : ''}`,
      diffDays,
    };
  }
}

// Friendly date formatting
export function formatCareDate(dateStr) {
  if (!dateStr) return 'Never';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatCareDateTime(dateStr) {
  if (!dateStr) return 'Never';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
}

export default function GardenTracker({ onNavigateToScanner, onUpdateAlerts }) {
  const [plants, setPlants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, overdue, due_today, on_track
  
  // Action state tracking per-plant
  const [wateringMap, setWateringMap] = useState({});
  const [waterSuccessMap, setWaterSuccessMap] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [plantToDelete, setPlantToDelete] = useState(null);

  // Fetch garden plants from backend
  const fetchGardenPlants = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.getGardenPlants();
      setPlants(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load garden plants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGardenPlants();
  }, []);

  // Water plant handler
  const handleWaterPlant = async (plant) => {
    if (wateringMap[plant.id]) return; // Guard rapid double clicks

    try {
      setActionError(null);
      setWateringMap((prev) => ({ ...prev, [plant.id]: true }));
      const res = await api.waterPlant(plant.id);

      // Update local state with new timestamps from server response
      setPlants((prev) =>
        prev.map((p) => {
          if (p.id === plant.id) {
            return {
              ...p,
              last_watered_at: res.last_watered_at || new Date().toISOString(),
              next_water_due: res.next_water_due,
            };
          }
          return p;
        })
      );

      // Flash momentary success badge
      setWaterSuccessMap((prev) => ({ ...prev, [plant.id]: true }));
      setTimeout(() => {
        setWaterSuccessMap((prev) => ({ ...prev, [plant.id]: false }));
      }, 3000);

      // Refresh global alerts counter in Navbar (immediate + delayed for worker settlement)
      if (onUpdateAlerts) {
        onUpdateAlerts();
        setTimeout(onUpdateAlerts, 400);
      }
    } catch (err) {
      setActionError('Failed to water plant: ' + (err.response?.data?.error || err.message));
    } finally {
      setWateringMap((prev) => ({ ...prev, [plant.id]: false }));
    }
  };

  // Remove plant handler
  const confirmDeletePlant = async () => {
    if (!plantToDelete) return;

    try {
      setActionError(null);
      setDeletingId(plantToDelete.id);
      await api.deleteGardenPlant(plantToDelete.id);

      // Remove from list
      setPlants((prev) => prev.filter((p) => p.id !== plantToDelete.id));
      setPlantToDelete(null);

      // Refresh global alerts
      if (onUpdateAlerts) {
        onUpdateAlerts();
        setTimeout(onUpdateAlerts, 400);
      }
    } catch (err) {
      setActionError('Failed to remove plant: ' + (err.response?.data?.error || err.message));
    } finally {
      setDeletingId(null);
    }
  };

  // Compute status summary metrics
  const summary = useMemo(() => {
    let overdueCount = 0;
    let dueTodayCount = 0;
    let onTrackCount = 0;

    plants.forEach((plant) => {
      const status = computeCareStatus(plant.next_water_due).key;
      if (status === 'overdue') overdueCount++;
      else if (status === 'due_today') dueTodayCount++;
      else onTrackCount++;
    });

    return {
      total: plants.length,
      overdue: overdueCount,
      dueToday: dueTodayCount,
      onTrack: onTrackCount,
      needsAttention: overdueCount + dueTodayCount,
    };
  }, [plants]);

  // Filtered plants list (nickname, species, notes, or disease)
  const filteredPlants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return plants.filter((plant) => {
      // Search filter
      const matchesSearch =
        !q ||
        (plant.custom_name || '').toLowerCase().includes(q) ||
        (plant.plant_type || '').toLowerCase().includes(q) ||
        (plant.notes || '').toLowerCase().includes(q) ||
        (plant.diagnosis?.disease_name || '').toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // Status filter
      if (statusFilter === 'all') return true;
      const statusKey = computeCareStatus(plant.next_water_due).key;
      return statusKey === statusFilter;
    });
  }, [plants, searchQuery, statusFilter]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* Top Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <Sprout className="w-6 h-6" />
            </div>
            My Garden Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time hydration monitoring and proactive care reminders for all tracked crops.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchGardenPlants}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shadow-sm"
            title="Refresh garden status"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
          </button>

          <button
            onClick={onNavigateToScanner}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Scan New Plant
          </button>
        </div>
      </div>

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Plants */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Plants</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.total}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <Leaf className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Overdue */}
        <div className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between ${
          summary.overdue > 0 ? 'border-red-300 bg-red-50/20' : 'border-slate-200'
        }`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-red-600">Overdue</p>
            <p className="text-2xl font-extrabold text-red-700 mt-1">{summary.overdue}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        {/* Due Today */}
        <div className={`bg-white p-5 rounded-2xl border shadow-sm flex items-center justify-between ${
          summary.dueToday > 0 ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
        }`}>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Due Today</p>
            <p className="text-2xl font-extrabold text-amber-700 mt-1">{summary.dueToday}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* On Track */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">On Track</p>
            <p className="text-2xl font-extrabold text-emerald-700 mt-1">{summary.onTrack}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Urgent Overdue Alert Banner (if any) */}
      {summary.overdue > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-red-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center text-red-600 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {summary.overdue} plant{summary.overdue > 1 ? 's' : ''} require immediate watering!
              </p>
              <p className="text-xs text-red-700">
                Moisture deficiency stress can lower immunity to fungal and bacterial leaf pathologies.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('overdue')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition flex-shrink-0"
          >
            Show Overdue
          </button>
        </div>
      )}

      {/* Action Error Banner (if any) */}
      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between gap-3 text-red-700 text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600" />
            <span>{actionError}</span>
          </div>
          <button
            onClick={() => setActionError(null)}
            className="text-red-700 hover:text-red-900 font-bold text-sm px-2 py-0.5 rounded"
          >
            &times;
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by nickname, species, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({summary.total})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'overdue'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overdue ({summary.overdue})
          </button>
          <button
            onClick={() => setStatusFilter('due_today')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'due_today'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Due Today ({summary.dueToday})
          </button>
          <button
            onClick={() => setStatusFilter('on_track')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              statusFilter === 'on_track'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            On Track ({summary.onTrack})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        // Loading Skeletons
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                </div>
              </div>
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : error ? (
        // Error State
        <div className="bg-white rounded-2xl p-8 border border-red-200 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-slate-900">Failed to Load Garden</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            onClick={fetchGardenPlants}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl hover:bg-emerald-700 transition"
          >
            Retry Connection
          </button>
        </div>
      ) : plants.length === 0 ? (
        // Empty State (Zero plants in database)
        <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center space-y-5 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">Your Garden is Empty</h2>
            <p className="text-slate-500 text-sm">
              Keep your crops thriving! Scan any plant leaf to diagnose health issues, then save it to track watering schedules.
            </p>
          </div>
          <button
            onClick={onNavigateToScanner}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" /> Scan Your First Leaf
          </button>
        </div>
      ) : filteredPlants.length === 0 ? (
        // No match for search/filter
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3 shadow-sm">
          <p className="text-slate-500 text-sm font-semibold">
            No plants match your current filter or query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        // Plant Cards Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => {
            const careStatus = computeCareStatus(plant.next_water_due);
            const isWatering = !!wateringMap[plant.id];
            const isJustWatered = !!waterSuccessMap[plant.id];
            const hasDiagnosis = !!plant.diagnosis;

            return (
              <div
                key={plant.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  
                  {/* Card Header & Status Badge */}
                  <div className="p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      
                      {/* Thumbnail or Plant Icon */}
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {hasDiagnosis && (plant.diagnosis.image_path || plant.diagnosis.image_url) ? (
                            <img
                              src={plant.diagnosis.image_path || plant.diagnosis.image_url}
                              alt={plant.custom_name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/test_samples/sample_leaf.jpg';
                              }}
                            />
                          ) : (
                            <Leaf className="w-6 h-6 text-emerald-600" />
                          )}
                        </div>

                        <div>
                          <h3 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug">
                            {plant.custom_name}
                          </h3>
                          <span className="text-xs text-slate-500 font-semibold block">
                            {plant.plant_type}
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Status Badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${careStatus.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${careStatus.dotClass}`} />
                        {careStatus.label}
                      </span>
                    </div>

                    {/* Associated Diagnosis Pill (if linked) */}
                    {hasDiagnosis && (
                      <div className="mt-3 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Diagnosis:</span>
                        <span className={`font-bold ${plant.diagnosis.is_healthy ? 'text-emerald-700' : 'text-red-700'}`}>
                          {plant.diagnosis.disease_name || (plant.diagnosis.is_healthy ? 'Healthy' : 'Diseased')}
                        </span>
                      </div>
                    )}

                    {/* Care Notes */}
                    {plant.notes && (
                      <p className="mt-2 text-xs text-slate-600 italic bg-slate-50/60 p-2 rounded-lg border border-slate-100">
                        &ldquo;{plant.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Care Schedule Timers */}
                  <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> Watering Interval
                      </span>
                      <span className="font-bold text-slate-800">
                        Every {plant.watering_interval_days} day{plant.watering_interval_days > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Droplet className="w-3.5 h-3.5 text-blue-400" /> Last Watered
                      </span>
                      <span className="font-semibold text-slate-700">
                        {formatCareDateTime(plant.last_watered_at)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Next Water Due
                      </span>
                      <span className={`font-bold ${careStatus.textClass}`}>
                        {formatCareDate(plant.next_water_due)}
                        <span className="text-[10px] ml-1 font-normal text-slate-500">
                          ({careStatus.description})
                        </span>
                      </span>
                    </div>
                  </div>

                </div>

                {/* Card Action Footer */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPlantToDelete(plant)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                    title="Remove from Garden"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleWaterPlant(plant)}
                    disabled={isWatering}
                    className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                      isJustWatered
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                    } disabled:opacity-50`}
                  >
                    {isWatering ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        Watering...
                      </>
                    ) : isJustWatered ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        Watered!
                      </>
                    ) : (
                      <>
                        <Droplet className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                        Water Now
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal: Remove Plant */}
      {plantToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-base text-slate-900">Remove Plant?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to stop tracking <strong>{plantToDelete.custom_name}</strong>? All hydration logs will be erased.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPlantToDelete(null)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePlant}
                disabled={deletingId === plantToDelete.id}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {deletingId === plantToDelete.id ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
