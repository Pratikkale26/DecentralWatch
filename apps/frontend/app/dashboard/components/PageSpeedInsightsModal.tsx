/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState, useCallback } from 'react';

interface PageSpeedInsightsModalProps {
  url: string;
}

// color helpers
function getScoreColor(score: number | null | undefined) {
  if (score == null) return 'text-gray-400';
  if (score >= 90) return 'text-green-600';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
}
function getStatusColor(status: string) {
  if (status === 'GOOD') return 'text-green-600';
  if (status === 'NEEDS_IMPROVEMENT') return 'text-yellow-500';
  if (status === 'POOR') return 'text-red-500';
  return 'text-gray-400';
}

const METRIC_LABELS: Record<string, { label: string; good: string; unit?: string }> = {
  'first-contentful-paint':    { label: 'First Contentful Paint',    good: '≤ 1.8s', unit: 's' },
  'largest-contentful-paint': { label: 'Largest Contentful Paint',   good: '≤ 2.5s', unit: 's' },
  'speed-index':              { label: 'Speed Index',                 good: '≤ 3.4s', unit: 's' },
  'total-blocking-time':      { label: 'Total Blocking Time',         good: '≤ 200ms', unit: 'ms' },
  'cumulative-layout-shift':  { label: 'Cumulative Layout Shift',     good: '≤ 0.1' },
  'interactive':              { label: 'Time to Interactive',          good: '≤ 3.8s', unit: 's' },
  'server-response-time':     { label: 'Time to First Byte',          good: '≤ 0.2s', unit: 'ms' },
};

// Minimal types for API response
interface LighthouseCategory { score?: number; title?: string; }
interface LighthouseAudit { id?: string; title?: string; displayValue?: string; numericValue?: number; score?: number; details?: { data?: string }; }
interface LighthouseResult {
  categories?: {
    performance?: LighthouseCategory;
    accessibility?: LighthouseCategory;
    'best-practices'?: LighthouseCategory;
    seo?: LighthouseCategory;
    [key: string]: LighthouseCategory | undefined;
  };
  audits?: Record<string, LighthouseAudit>;
  fetchTime?: string;
  configSettings?: { formFactor?: string };
  finalUrl?: string;
}
interface PageSpeedApiMetrics {
  [key: string]: {
    percentile?: number;
    category?: string;
    [k: string]: unknown;
  };
}
interface PageSpeedApiResponse {
  lighthouseResult?: LighthouseResult;
  loadingExperience?: {
    metrics?: PageSpeedApiMetrics;
    overall_category?: string;
  };
  originLoadingExperience?: {
    metrics?: PageSpeedApiMetrics;
    overall_category?: string;
  };
}

export function PageSpeedInsightsModal({ url }: PageSpeedInsightsModalProps) {
  const [strategy, setStrategy] = useState<'desktop'|'mobile'>('desktop');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string|null>(null);
  const [data, setData]         = useState<PageSpeedApiResponse|null>(null);

  const reportLink = `https://pagespeed.web.dev/analysis?url=${encodeURIComponent(url)}&strategy=${strategy}`;

  // fetch data
  const fetchData = useCallback(() => {
    if (!url) return;
    setLoading(true);
    setError(null);
    setData(null);
    const key = process.env.NEXT_PUBLIC_PSI_API_KEY;
    if (!key) {
      setError('API key not found');
      setLoading(false);
      return;
    }
    const CATEGORIES = [
      'performance',
      'accessibility',
      'best-practices',
      'seo',
    ].map(cat => `category=${cat}`).join('&');
    fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?` +
        `url=${encodeURIComponent(url)}` +
        `&key=${key}` +
        `&strategy=${strategy}` +
        `&${CATEGORIES}`
    )
      .then(r => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then(json => setData(json as PageSpeedApiResponse))
      .catch(err => setError(String(err)))
      .finally(() => setLoading(false));
  }, [url, strategy]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading)
    return (
      <div className="py-16 text-center text-lg font-semibold">
        Loading PageSpeed Insights...
      </div>
    );
  if (error)
    return (
      <div className="py-16 text-center text-red-500 text-lg font-semibold">
        {error}
        <button
          onClick={fetchData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  if (!data) return null;

  const lr         = data.lighthouseResult;
  const cats       = lr?.categories || {};
  const perf       = cats.performance;
  const acc        = cats.accessibility;
  const bp         = cats['best-practices'];
  const seo        = cats.seo;
  const audits     = lr?.audits || {};
  const screenshot = audits['final-screenshot']?.details?.data;
  const field      = data.loadingExperience?.metrics || data.originLoadingExperience?.metrics;
  const cwv        = field && {
    LCP:  field.LARGEST_CONTENTFUL_PAINT_MS,
    FCP:  field.FIRST_CONTENTFUL_PAINT_MS,
    CLS:  field.CUMULATIVE_LAYOUT_SHIFT_SCORE,
    INP:  field.INTERACTION_TO_NEXT_PAINT,
    TTFB: field.EXPERIMENTAL_TIME_TO_FIRST_BYTE,
  };
  const cwvStatus  = data.loadingExperience?.overall_category
                  || data.originLoadingExperience?.overall_category;
  const labMetrics: Record<string, LighthouseAudit | undefined> = {
    'first-contentful-paint':    audits['first-contentful-paint'],
    'largest-contentful-paint':  audits['largest-contentful-paint'],
    'speed-index':               audits['speed-index'],
    'total-blocking-time':       audits['total-blocking-time'],
    'cumulative-layout-shift':   audits['cumulative-layout-shift'],
    interactive:                 audits.interactive,
    'server-response-time':      audits['server-response-time'],
  };
  const fetchTime  = lr?.fetchTime;
  const device     = lr?.configSettings?.formFactor || 'desktop';
  const pageTitle  = lr?.finalUrl || url;
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}`;

  return (
    <div className="w-full h-full max-w-full max-h-full overflow-y-auto bg-gradient-to-br from-white via-zinc-50 to-zinc-100 dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 rounded-xl shadow-2xl flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur border-b border-gray-200 dark:border-zinc-800 px-4 sm:px-8 py-4 flex items-center gap-4 rounded-t-xl">
        <img src={faviconUrl} alt="" className="w-8 h-8 rounded" />
        <div className="flex-1 min-w-0">
          <div className="truncate font-semibold text-lg text-gray-900 dark:text-white">
            {pageTitle}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
            Last analyzed: {fetchTime ? new Date(fetchTime).toLocaleString() : 'N/A'} • Device: {device.charAt(0).toUpperCase()+device.slice(1)}
          </div>
        </div>
        <a
          href={reportLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Full Report
        </a>
        <button
          onClick={() => navigator.clipboard.writeText(reportLink)}
          className="text-xs px-3 py-1 bg-gray-200 dark:bg-zinc-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-zinc-600 transition"
        >
          Copy Link
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-8">
        {/* Strategy selector */}
        <div>
          <label htmlFor="strategy" className="text-xs text-gray-500 mr-2">
            Strategy:
          </label>
          <select
            id="strategy"
            value={strategy}
            onChange={e => setStrategy(e.target.value as 'desktop' | 'mobile')}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
          </select>
        </div>

        {/* Scorecard */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col gap-6 border border-gray-100 dark:border-zinc-800">
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              Overall Health Scorecard
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Performance', key: perf },
                { label: 'SEO', key: seo },
                { label: 'Accessibility', key: acc },
                { label: 'Best Practices', key: bp },
              ].map(({ label, key }) => (
                <div key={label} className="flex flex-col items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {label}
                  </span>
                  <span
                    className={`text-4xl font-extrabold ${
                      getScoreColor(key?.score ? Math.round(key.score * 100) : null)
                    }`}
                  >
                    {key?.score != null ? Math.round(key.score * 100) : 'N/A'}
                  </span>
                  <span className="text-xs text-gray-400">Good: 90-100</span>
                </div>
              ))}
            </div>
          </div>
          {screenshot && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 flex flex-col items-center border border-gray-100 dark:border-zinc-800">
              <img
                src={screenshot}
                alt="Website Screenshot"
                className="rounded-lg border shadow max-w-full max-h-60 mb-2"
              />
              <span className="text-xs text-gray-400">Website Screenshot</span>
            </div>
          )}
        </div>

        {/* Core Web Vitals */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-gray-100 dark:border-zinc-800">
          <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
            Core Web Vitals Status
          </h4>
          {cwv ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 mb-2">
              {Object.entries(cwv).map(([key, metric]) => (
                metric && (
                  <div key={key} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">
                      {key}
                    </span>
                    <span className={`text-2xl font-bold ${getStatusColor(String(metric.category))}`}>
                      {metric.percentile
                        ? (key === 'CLS'
                          ? (metric.percentile / 100).toFixed(2)
                          : (metric.percentile / 1000).toFixed(2) + 's')
                        : 'N/A'}
                    </span>
                    <span className="text-xs text-gray-400 capitalize">
                      {metric.category?.replace('_', ' ').toLowerCase() || ''}
                    </span>
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="text-xs text-gray-400">
              Loading experience metrics are unavailable.
            </div>
          )}
          <div className="text-xs text-gray-400 mt-1">
            Overall:{' '}
            <span className={getStatusColor(String(cwvStatus))}>
              {String(cwvStatus).replace('_', ' ').toLowerCase()}
            </span>
          </div>
        </div>

        {/* Lab Metrics */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl shadow p-6 border border-gray-100 dark:border-zinc-800">
          <h4 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
            Key Lab Performance Metrics
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Object.entries(METRIC_LABELS).map(([key, { label, good, unit }]) => {
              const metric = labMetrics[key];
              let value = metric?.displayValue || metric?.numericValue;
              if (typeof value === 'number') {
                if (unit === 's') value = (value / 1000).toFixed(2) + 's';
                else if (unit === 'ms') value = Math.round(value) + 'ms';
                else value = value.toString();
              }
              return (
                <div
                  key={key}
                  className="flex flex-col gap-1 items-center bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-zinc-700"
                >
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {label}
                  </span>
                  <span className={`text-xl font-bold ${getScoreColor(metric?.score ? Math.round(metric.score * 100) : null)}`}>
                    {value || 'N/A'}
                  </span>
                  <span className="text-xs text-gray-400">Good: {good}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-gray-400 text-center pt-2">
          Powered by Google PageSpeed Insights
        </div>
      </div>
    </div>
  );
}
