/**
 * ============================================================
 * WEATHER RISK PAGE (Objective 3)
 * Search ANY place in Sri Lanka → real-time weather + Python risk
 * Flow: Type place → OpenWeatherMap Geocoding → Weather → Python
 * ============================================================
 */
import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import RiskBadge from '../../components/ui/RiskBadge';
import LiveBadge from '../../components/ui/LiveBadge';
import { IconMapPin, IconCloudSun, RiskReportIcon, WeatherStatIcon } from '../../components/ui/Icons';
import { weatherAPI } from '../../services/api';
import { FormField, Input } from '../../components/ui/FormField';
import { useToast } from '../../context/ToastContext';

const WeatherRiskPage = () => {
  const [placeName, setPlaceName] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  // Load place suggestions as user types
  useEffect(() => {
    if (placeName.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(() => {
      weatherAPI.searchPlaces(placeName)
        .then(({ data }) => setSuggestions(data.places || []))
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timer);
  }, [placeName]);

  const handleSelectPlace = (name) => {
    setPlaceName(name);
    setShowSuggestions(false);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!placeName.trim()) {
      const msg = 'Please enter a place in Sri Lanka (e.g. Kandy, Ella, Jaffna).';
      setError(msg);
      showToast(msg, 'warning');
      return;
    }
    if (!travelDate) {
      const msg = 'Please select a travel date.';
      setError(msg);
      showToast(msg, 'warning');
      return;
    }

    setLoading(true);
    try {
      const { data } = await weatherAPI.analyze({
        place_name: placeName.trim(),
        travel_date: travelDate,
      });
      setResult(data);
      const risk = data.analysis?.risk_level;
      showToast(`Weather analysis complete for ${data.destination.name}.`, 'success');
      if (risk === 'moderate' || risk === 'high') {
        showToast('Risk alert email sent to your registered email.', 'info');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Weather check failed. Please try again later.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { data } = await weatherAPI.downloadPdf(result);
      const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `weather-risk-${result.destination?.name || 'report'}-${result.travel_date || ''}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showToast('PDF downloaded.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not download the PDF.', 'error');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleEmailPdf = async () => {
    if (!result) return;
    setEmailLoading(true);
    try {
      const { data } = await weatherAPI.emailPdf(result);
      showToast(data.message || 'PDF emailed to your registered address.', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Could not email the PDF.', 'error');
    } finally {
      setEmailLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 mb-4">
            <IconCloudSun className="w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-3xl text-gray-900 mb-2">Weather Risk Analysis</h1>
          <p className="text-gray-500">Check weather for any place in Sri Lanka before you travel</p>
        </div>

        {/* ===== SEARCH ANY PLACE IN SRI LANKA ===== */}
        <form onSubmit={handleAnalyze} className="weather-search-form-card weather-search-form-section">

          {/* Place search input */}
          <FormField label="Search Place in Sri Lanka" required>
            <div className="relative">
              <Input
                value={placeName}
                onChange={(e) => { setPlaceName(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Type any place... e.g. Kandy, Ella, Jaffna, Mirissa"
                autoComplete="off"
                required
              />

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((p) => (
                    <li key={`${p.name}-${p.lat}`}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-primary-50 text-sm"
                        onClick={() => handleSelectPlace(p.name)}
                      >
                        <span className="flex items-center gap-2">
                          <IconMapPin className="w-4 h-4 text-primary-500" />
                          {p.name}{p.state ? `, ${p.state}` : ''} — Sri Lanka
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Examples: Colombo, Sigiriya, Nuwara Eliya, Trincomalee, Arugam Bay
            </p>
          </FormField>

          <FormField label="Travel Date" required>
            <Input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              required
            />
          </FormField>

          <Button type="submit" btnClass="analyze-weather-btn" loading={loading} className="w-full">
            Get Real-Time Weather & Risk Analysis
          </Button>
        </form>

        {error && <Alert type="error" message={error} />}

        {result && (
          <div className="animate-slide-up space-y-6">
            {/* Risk Report Card */}
            <div className={`card text-center border-2 ${
              result.analysis.risk_level === 'safe' ? 'border-green-200 bg-green-50' :
              result.analysis.risk_level === 'moderate' ? 'border-yellow-200 bg-yellow-50' :
              'border-red-200 bg-red-50'
            }`}>
              <RiskReportIcon level={result.analysis.risk_level} />
              <h3 className="font-display font-bold text-xl mt-4 mb-1">Travel Risk Report</h3>
              <p className="text-sm text-gray-500 mb-4">{result.destination.name} · {result.travel_date}</p>
              <RiskBadge level={result.analysis.risk_level} />
              <p className="text-base font-medium text-gray-800 mt-4 leading-relaxed">{result.analysis.recommendation}</p>
              <div className="mt-4 flex justify-center">
                <LiveBadge source="Live Weather" fetchedAt={result.weather.fetchedAt} />
              </div>
            </div>

            <div className="weather-result-card">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
                  <IconMapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl">{result.destination.name}</h3>
                  <p className="text-gray-500 text-sm">Sri Lanka · Real-time weather data</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Temperature', value: `${Math.round(result.weather.temperature)}°C` },
                  { label: 'Rainfall', value: `${result.weather.rain_mm} mm` },
                  { label: 'Wind Speed', value: `${Math.round(result.weather.wind_speed_kmh)} km/h` },
                  { label: 'Humidity', value: `${result.weather.humidity}%` },
                ].map((item) => (
                  <div key={item.label} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                    <div className="flex justify-center mb-2">
                      <WeatherStatIcon label={item.label} />
                    </div>
                    <p className="text-xs text-gray-500">{item.label}</p>
                    <p className="font-bold text-lg">{item.value}</p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500 capitalize mt-4">
                Condition: {result.weather.description}
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  btnClass="download-weather-pdf-btn"
                  className="w-full"
                  loading={pdfLoading}
                  onClick={handleDownloadPdf}
                >
                  Download PDF
                </Button>
                <Button
                  type="button"
                  btnClass="email-weather-pdf-btn"
                  className="w-full"
                  loading={emailLoading}
                  onClick={handleEmailPdf}
                >
                  Email PDF to me
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                Download a copy, send it to your registered email, or both.
              </p>
            </div>

            <div className="glass-card">
              <h4 className="font-semibold mb-3">How we assess travel risk</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>High Risk:</strong> Rain &gt; 20mm OR Wind &gt; 35 km/h</p>
                <p><strong>Moderate Risk:</strong> Rain 5-20mm OR Wind 20-35 km/h</p>
                <p><strong>Safe:</strong> All conditions within safe ranges</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WeatherRiskPage;
