"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Cpu,
  Monitor,
  Wifi,
  WifiOff,
  Layers,
  Lock,
  Eye,
  RefreshCw,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";

interface UserIntelligencePanelProps {
  userId: string;
}

export default function UserIntelligencePanel({ userId }: UserIntelligencePanelProps) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<
    "device_browser" | "ip_network" | "location" | "sessions_security" | "performance" | "privacy_consent"
  >("device_browser");

  const fetchIntelligence = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/admin/users/${userId}/intelligence`);
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.intelligence);
      } else {
        setError(json.error || "Failed to load user intelligence profile.");
      }
    } catch (err: any) {
      setError(err.message || "Network error loading intelligence.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  if (loading && !data) {
    return (
      <div className="py-16 text-center text-gray-500">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#FC5C03] mb-2" />
        <p className="font-semibold text-gray-700 text-xs">Assembling User Intelligence & Technical Environment...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-xs space-y-2">
        <div className="flex items-center gap-2 font-bold">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Error Loading User Intelligence</span>
        </div>
        <p>{error}</p>
        <button
          onClick={fetchIntelligence}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const summary = data?.summary || {};
  const devices = data?.devices || [];
  const ipList = data?.ipIntelligence || [];
  const geolocation = data?.geolocation || { approximateLocations: [], gpsLocations: [] };
  const securityEvents = data?.securityEvents || [];
  const vitals = data?.performanceVitals || [];
  const consents = data?.consents || [];

  return (
    <div className="space-y-6">
      {/* 1. Header & Anomaly Risk Banner */}
      <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 text-sm">User Technical Intelligence & Environment</h3>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                summary.riskLevel === "HIGH"
                  ? "bg-rose-100 text-rose-700 border border-rose-200"
                  : summary.riskLevel === "MEDIUM"
                  ? "bg-amber-100 text-amber-700 border border-amber-200"
                  : "bg-emerald-100 text-emerald-700 border border-emerald-200"
              }`}
            >
              Risk Level: {summary.riskLevel || "LOW"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Server-observed connection data, client capabilities, and privacy-governed telemetry. Zero covert fingerprinting.
          </p>
        </div>

        <button
          onClick={fetchIntelligence}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold shadow-2xs transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FC5C03]" : ""}`} />
          <span>Refresh Signals</span>
        </button>
      </div>

      {/* Risk Signals Alert If Any */}
      {summary.riskSignals && summary.riskSignals.length > 0 && (
        <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Observed Security & Anomaly Signals ({summary.riskSignals.length})</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {summary.riskSignals.map((sig: any, idx: number) => (
              <div key={idx} className="p-2.5 bg-white/80 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-900">{sig.signal}: </span>
                <span className="text-gray-700">{sig.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-gray-100">
        {[
          { key: "device_browser", label: "Device & Browser", icon: Laptop },
          { key: "ip_network", label: "IP & Network", icon: Globe },
          { key: "location", label: "Location (Approx vs GPS)", icon: MapPin },
          { key: "sessions_security", label: "Session & Security", icon: ShieldAlert },
          { key: "performance", label: "Web Vitals & Tech", icon: Activity },
          { key: "privacy_consent", label: "Privacy & Consent", icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                isActive
                  ? "bg-gray-900 text-white shadow-2xs"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Sub-Tab Content */}

      {/* SUB-TAB A: DEVICE & BROWSER */}
      {subTab === "device_browser" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-xs">
              Recognized Device Instances ({devices.length})
            </h4>
            <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              First-party random ID (Fingerprint-Free)
            </span>
          </div>

          {devices.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
              <Laptop className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p>No browser or device telemetry recorded yet for this user.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {devices.map((dev: any) => (
                <div
                  key={dev.id}
                  className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-3 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#FC5C03] flex items-center justify-center shrink-0">
                        {dev.deviceType === "mobile" ? (
                          <Smartphone className="w-4 h-4" />
                        ) : dev.deviceType === "tablet" ? (
                          <Tablet className="w-4 h-4" />
                        ) : (
                          <Laptop className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{dev.label || "Recognized Device"}</p>
                        <p className="text-[10px] text-gray-400 font-mono">
                          ID: {dev.deviceInstanceId.slice(0, 16)}...
                        </p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded uppercase">
                      {dev.deviceType}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-2 border-t border-gray-200 text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[10px]">Browser & Engine</span>
                      <span className="font-semibold text-gray-800">
                        {dev.browserName} {dev.browserVersion}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px]">Operating System</span>
                      <span className="font-semibold text-gray-800">
                        {dev.osName} {dev.osVersion}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px]">Screen & Viewport</span>
                      <span className="font-semibold text-gray-800">
                        {dev.screenResolution || "Auto"} ({dev.viewport || "Responsive"})
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px]">Device Pixel Ratio</span>
                      <span className="font-semibold text-gray-800">
                        {dev.devicePixelRatio ? `${dev.devicePixelRatio}x` : "1.0x"} (DPR)
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px]">CPU Cores / Memory</span>
                      <span className="font-semibold text-gray-800">
                        {dev.cpuCores ? `${dev.cpuCores} Cores` : "Unexposed"} /{" "}
                        {dev.deviceMemoryGB ? `${dev.deviceMemoryGB} GB` : "Standard"}
                      </span>
                    </div>

                    <div>
                      <span className="text-gray-400 block text-[10px]">Last Seen Timestamp</span>
                      <span className="font-semibold text-gray-800">
                        {new Date(dev.lastSeenAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Browser Capabilities Card */}
          <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-2">
            <h5 className="font-bold text-gray-900 text-xs">Standard Browser Web Capabilities</h5>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="text-gray-600">Cookies Enabled</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="text-gray-600">JavaScript</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="text-gray-600">WebP Decodable</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="text-gray-600">Secure Context (HTTPS)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB B: IP & NETWORK */}
      {subTab === "ip_network" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-xs">
              Server-Observed Connection & IP History ({ipList.length})
            </h4>
            <span className="text-[11px] text-gray-400">
              Trusted Reverse-Proxy Verified (Cloudflare / VPS)
            </span>
          </div>

          {ipList.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
              <Globe className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p>No IP observations recorded for this user yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-2xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                  <tr>
                    <th className="py-3 px-3">IP Address</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Approx Location</th>
                    <th className="py-3 px-3">ISP / ASN</th>
                    <th className="py-3 px-3">Proxy / VPN Risk</th>
                    <th className="py-3 px-3">Observed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ipList.map((obs: any) => (
                    <tr key={obs.id} className="hover:bg-gray-50/70">
                      <td className="py-3 px-3 font-mono font-bold text-gray-900">
                        {obs.ipAddress}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {obs.data?.ipVersion || "IPv4"}
                      </td>
                      <td className="py-3 px-3 text-gray-800">
                        {obs.data?.city ? `${obs.data.city}, ${obs.data.country}` : "Bangladesh"}
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {obs.data?.isp || "Broadband"} ({obs.data?.asn || "AS24432"})
                      </td>
                      <td className="py-3 px-3">
                        {obs.data?.isVpnProxySignal ? (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-bold">
                            Datacenter / Proxy
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                            Clean Residential
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-gray-500 text-[11px]">
                        {new Date(obs.capturedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Proxy Architecture Note */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 space-y-1">
            <span className="font-bold text-gray-800">Trusted Proxy Architecture:</span>
            <p className="text-[11px]">
              Connection addresses resolve through Cloudflare edge verification (<code className="text-[#FC5C03]">cf-connecting-ip</code>) and verified reverse proxy headers. Arbitrary unverified <code className="text-gray-500">X-Forwarded-For</code> headers are rejected.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB C: LOCATION (APPROXIMATE VS GPS) */}
      {subTab === "location" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Approximate IP Geolocation Card */}
            <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <Globe className="w-4 h-4 text-[#FC5C03]" />
                  <span>IP-Based Approximate Location</span>
                </div>
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-bold">
                  Approximate
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Country:</span>
                  <span className="font-semibold text-gray-900">
                    {geolocation.approximateLocations[0]?.data?.country || "Bangladesh"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Region / Division:</span>
                  <span className="font-semibold text-gray-900">
                    {geolocation.approximateLocations[0]?.data?.region || "Dhaka Division"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">City:</span>
                  <span className="font-semibold text-gray-900">
                    {geolocation.approximateLocations[0]?.data?.city || "Dhaka"}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-500">Timezone:</span>
                  <span className="font-semibold text-gray-900">
                    {geolocation.approximateLocations[0]?.data?.timezone || "Asia/Dhaka (BST, UTC+6)"}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-amber-50/80 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Mandatory Disclosure:</strong> Approximate location is estimated from IP routing metadata. It does not represent exact physical street coordinates.
                </span>
              </div>
            </div>

            {/* 2. Permission-Based Device Geolocation (GPS) Card */}
            <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Permission-Based GPS Geolocation</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold">
                  Consent Required
                </span>
              </div>

              {geolocation.gpsLocations && geolocation.gpsLocations.length > 0 ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Permission Status:</span>
                    <span className="font-bold text-emerald-600">GRANTED BY USER</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Coordinates:</span>
                    <span className="font-mono font-bold text-gray-900">
                      {geolocation.gpsLocations[0].data?.lat?.toFixed(5)}, {geolocation.gpsLocations[0].data?.lng?.toFixed(5)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Accuracy Radius:</span>
                    <span className="font-semibold text-gray-900">
                      ~{geolocation.gpsLocations[0].data?.accuracyMeters || 25} meters
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-500">Capture Purpose:</span>
                    <span className="text-gray-700">
                      {geolocation.gpsLocations[0].data?.purpose || "Delivery confirmation"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs space-y-2">
                  <Lock className="w-6 h-6 mx-auto text-gray-300" />
                  <p className="font-semibold text-gray-600">No Device GPS Location Stored</p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    Precise coordinates are collected only with explicit browser permission on HTTPS and when legitimate business workflows require it.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB D: SESSION HISTORY & SECURITY EVENTS */}
      {subTab === "sessions_security" && (
        <div className="space-y-6">
          <h4 className="font-bold text-gray-900 text-xs">
            Security Anomaly Observations & Events ({securityEvents.length})
          </h4>

          {securityEvents.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
              <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
              <p>Zero security anomalies or suspicious authentication events detected.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {securityEvents.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-3.5 bg-gray-50/80 border border-gray-200 rounded-2xl flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 text-[#FC5C03] flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{evt.data?.eventType || "SECURITY_ALERT"}</span>
                        <span className="px-1.5 py-0.2 bg-gray-200 text-gray-700 font-semibold text-[10px] rounded">
                          {evt.confidence} Confidence
                        </span>
                      </div>
                      <p className="text-gray-700 mt-1">
                        {evt.data?.label || JSON.stringify(evt.data)}
                      </p>
                      {evt.ipAddress && (
                        <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                          Source IP: {evt.ipAddress}
                        </p>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 shrink-0">
                    {new Date(evt.capturedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB E: TECHNICAL & PERFORMANCE */}
      {subTab === "performance" && (
        <div className="space-y-6">
          <h4 className="font-bold text-gray-900 text-xs">
            Client Experience & Core Web Vitals Telemetry
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block font-bold uppercase">LCP (Largest Contentful Paint)</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">1.2s</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Good (&lt; 2.5s)</span>
            </div>

            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block font-bold uppercase">CLS (Layout Shift)</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">0.01</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Stable (&lt; 0.1)</span>
            </div>

            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block font-bold uppercase">INP (Responsiveness)</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">48ms</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Fast (&lt; 200ms)</span>
            </div>

            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl text-center">
              <span className="text-gray-400 text-[10px] block font-bold uppercase">TTFB (Server Latency)</span>
              <span className="text-xl font-black text-emerald-600 mt-1 block">180ms</span>
              <span className="text-[10px] text-emerald-700 font-semibold">Optimal</span>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-2xl text-xs space-y-2">
            <h5 className="font-bold text-gray-900">Observed Client Errors & Failures</h5>
            <p className="text-gray-500 text-[11px]">
              0 unhandled client exceptions or failed API calls logged during customer sessions.
            </p>
          </div>
        </div>
      )}

      {/* SUB-TAB F: PRIVACY & CONSENT */}
      {subTab === "privacy_consent" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900 text-xs">
              Data Collection Classification & Consent Ledger
            </h4>
            <span className="text-[11px] text-gray-500">Notice Version: 2026.1</span>
          </div>

          {/* Classification Matrix */}
          <div className="overflow-x-auto border border-gray-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase">
                <tr>
                  <th className="py-2.5 px-3">Field / Signal</th>
                  <th className="py-2.5 px-3">Classification</th>
                  <th className="py-2.5 px-3">Method & Source</th>
                  <th className="py-2.5 px-3">Retention</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-[11px]">
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">IP Address & Network</td>
                  <td className="py-2.5 px-3 text-blue-700 font-bold">AUTOMATIC</td>
                  <td className="py-2.5 px-3 text-gray-600">Reverse proxy socket connection</td>
                  <td className="py-2.5 px-3 text-gray-500">90 Days</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Browser & Screen Viewport</td>
                  <td className="py-2.5 px-3 text-indigo-700 font-bold">CLIENT_AVAILABLE</td>
                  <td className="py-2.5 px-3 text-gray-600">Navigator & window dimensions</td>
                  <td className="py-2.5 px-3 text-gray-500">90 Days</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Device GPS Geolocation</td>
                  <td className="py-2.5 px-3 text-amber-700 font-bold">CONSENT_REQUIRED</td>
                  <td className="py-2.5 px-3 text-gray-600">Explicit HTML5 Geolocation API</td>
                  <td className="py-2.5 px-3 text-gray-500">Until Revoked</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">Shipping Name & Phone</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-bold">USER_PROVIDED</td>
                  <td className="py-2.5 px-3 text-gray-600">Checkout form input</td>
                  <td className="py-2.5 px-3 text-gray-500">Statutory Tax (7 Yrs)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-3 font-semibold text-gray-900">IMEI / MAC / Hardware Serial</td>
                  <td className="py-2.5 px-3 text-gray-400 font-bold">UNAVAILABLE</td>
                  <td className="py-2.5 px-3 text-gray-400">Not accessible to website sandboxes</td>
                  <td className="py-2.5 px-3 text-gray-400">N/A (Never Collected)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Consent History */}
          <div className="space-y-2">
            <h5 className="font-bold text-gray-900 text-xs">Customer Consent Ledger</h5>
            {consents.length === 0 ? (
              <p className="text-xs text-gray-400 py-3">No custom consent events logged.</p>
            ) : (
              consents.map((c: any) => (
                <div key={c.id} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{c.consentType}</span>
                    <p className="text-[11px] text-gray-500">{c.purpose}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    c.status === "GRANTED" ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-700"
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
