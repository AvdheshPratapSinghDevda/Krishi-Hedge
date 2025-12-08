'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface Alert {
  id: string;
  commodity: string;
  threshold: number;
  direction: 'ABOVE' | 'BELOW';
  currentPrice: number;
  triggered: boolean;
  createdAt: number;
}

const COMMODITIES = [
  { name: 'Soybean', currentPrice: 4850, symbol: '🌱', change: 120 },
  { name: 'Groundnut', currentPrice: 5200, symbol: '🥜', change: -80 },
  { name: 'Sunflower', currentPrice: 6100, symbol: '🌻', change: 200 },
  { name: 'Mustard', currentPrice: 5450, symbol: '🌾', change: 50 },
  { name: 'Cotton', currentPrice: 7200, symbol: '☁️', change: -150 },
  { name: 'Sesame', currentPrice: 9800, symbol: '🌰', change: 300 },
];

export default function AlertsPage() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState(COMMODITIES[0]);
  const [threshold, setThreshold] = useState('');
  const [direction, setDirection] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load alerts from localStorage
    const saved = localStorage.getItem('kh_price_alerts');
    if (saved) {
      setAlerts(JSON.parse(saved));
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        new Notification('KrishiHedge Alerts Enabled! 🔔', {
          body: 'You will now receive price alerts',
          icon: '/icon-192.png',
        });
      }
    }
  };

  const createAlert = () => {
    const thresholdPrice = parseFloat(threshold);
    if (isNaN(thresholdPrice) || thresholdPrice <= 0) {
      alert('Please enter a valid price');
      return;
    }

    const newAlert: Alert = {
      id: Date.now().toString(),
      commodity: selectedCommodity.name,
      threshold: thresholdPrice,
      direction,
      currentPrice: selectedCommodity.currentPrice,
      triggered: false,
      createdAt: Date.now(),
    };

    const updatedAlerts = [newAlert, ...alerts];
    setAlerts(updatedAlerts);
    localStorage.setItem('kh_price_alerts', JSON.stringify(updatedAlerts));

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
    setThreshold('');
  };

  const deleteAlert = (id: string) => {
    const updatedAlerts = alerts.filter(a => a.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('kh_price_alerts', JSON.stringify(updatedAlerts));
  };

  const triggerDemoAlert = () => {
    if (!notificationsEnabled) {
      alert('Please enable notifications first!');
      return;
    }

    // Create a demo notification
    new Notification('🚨 Price Alert Triggered!', {
      body: `${selectedCommodity.symbol} ${selectedCommodity.name} reached ₹${selectedCommodity.currentPrice}/quintal`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
    });

    // Mark first active alert as triggered
    if (alerts.length > 0 && !alerts[0].triggered) {
      const updatedAlerts = alerts.map((a, i) => 
        i === 0 ? { ...a, triggered: true } : a
      );
      setAlerts(updatedAlerts);
      localStorage.setItem('kh_price_alerts', JSON.stringify(updatedAlerts));
    }
  };

  const activeAlerts = alerts.filter(a => !a.triggered);
  const triggeredAlerts = alerts.filter(a => a.triggered);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pb-24">
      {showSuccess && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-bounce">
          <i className="fa-solid fa-check-circle mr-2"></i>
          Alert Created!
        </div>
      )}

      <header className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white px-6 pt-6 pb-16 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.push('/')}
              className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-bell text-yellow-300"></i>
              <span className="text-sm font-bold text-yellow-300">ALERTS</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1">Price Alerts</h1>
          <p className="text-blue-200 text-sm mb-6">Get notified when prices move</p>

          {/* Notification Permission */}
          {!notificationsEnabled && (
            <button
              onClick={requestNotificationPermission}
              className="w-full bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 hover:bg-white/20 transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-bell text-white text-xl"></i>
                </div>
                <div className="text-left flex-1">
                  <div className="font-bold">Enable Notifications</div>
                  <div className="text-sm text-blue-100">Tap to allow browser alerts</div>
                </div>
                <i className="fa-solid fa-chevron-right"></i>
              </div>
            </button>
          )}

          {notificationsEnabled && (
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20 flex items-center gap-2">
              <i className="fa-solid fa-check-circle text-green-300"></i>
              <span className="text-sm">Notifications Enabled</span>
            </div>
          )}
        </div>
      </header>

      <div className="px-6 -mt-8 relative z-10 space-y-4">
        {/* Create Alert */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-blue-100">
          <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
            <i className="fa-solid fa-plus-circle text-blue-600"></i>
            Create New Alert
          </h2>

          {/* Commodity Selector */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block font-medium">Select Commodity</label>
            <div className="grid grid-cols-3 gap-2">
              {COMMODITIES.map(comm => (
                <button
                  key={comm.name}
                  onClick={() => setSelectedCommodity(comm)}
                  className={`p-3 rounded-xl border-2 transition ${
                    selectedCommodity.name === comm.name
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="text-xl mb-1">{comm.symbol}</div>
                  <div className="text-xs font-bold text-gray-800">{comm.name}</div>
                  <div className="text-xs text-gray-600">₹{comm.currentPrice}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Price Display */}
          <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Current Price:</span>
              <div className="text-right">
                <div className="font-bold text-gray-800">₹{selectedCommodity.currentPrice}/quintal</div>
                <div className={`text-xs ${selectedCommodity.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedCommodity.change >= 0 ? '+' : ''}₹{selectedCommodity.change} today
                </div>
              </div>
            </div>
          </div>

          {/* Direction Selector */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block font-medium">Alert When Price Goes</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDirection('ABOVE')}
                className={`p-3 rounded-xl border-2 transition ${
                  direction === 'ABOVE'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <i className="fa-solid fa-arrow-up text-green-600 text-xl mb-1"></i>
                <div className="text-sm font-bold text-gray-800">Above</div>
              </button>
              <button
                onClick={() => setDirection('BELOW')}
                className={`p-3 rounded-xl border-2 transition ${
                  direction === 'BELOW'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <i className="fa-solid fa-arrow-down text-red-600 text-xl mb-1"></i>
                <div className="text-sm font-bold text-gray-800">Below</div>
              </button>
            </div>
          </div>

          {/* Threshold Input */}
          <div className="mb-4">
            <label className="text-sm text-gray-600 mb-2 block font-medium">
              Alert Price (₹/quintal)
            </label>
            <input
              type="number"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
              placeholder={`e.g., ${selectedCommodity.currentPrice + (direction === 'ABOVE' ? 100 : -100)}`}
            />
          </div>

          <button
            onClick={createAlert}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
          >
            <i className="fa-solid fa-bell mr-2"></i>
            Create Alert
          </button>
        </div>

        {/* Demo Alert Button */}
        {notificationsEnabled && (
          <button
            onClick={triggerDemoAlert}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-3 rounded-xl font-bold hover:shadow-lg transition"
          >
            <i className="fa-solid fa-bolt mr-2"></i>
            Trigger Demo Alert
          </button>
        )}

        {/* Active Alerts */}
        {activeAlerts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-blue-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-clock text-orange-500"></i>
              Active Alerts ({activeAlerts.length})
            </h3>
            
            <div className="space-y-3">
              {activeAlerts.map(alert => (
                <div key={alert.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-bold text-gray-800 mb-1">{alert.commodity}</div>
                      <div className="text-sm text-gray-600">
                        Alert when price goes{' '}
                        <span className={`font-bold ${alert.direction === 'ABOVE' ? 'text-green-600' : 'text-red-600'}`}>
                          {alert.direction === 'ABOVE' ? 'ABOVE' : 'BELOW'}
                        </span>
                        {' '}₹{alert.threshold}/quintal
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Current: ₹{alert.currentPrice}/quintal
                      </div>
                    </div>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    >
                      <i className="fa-solid fa-trash text-sm"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Triggered Alerts */}
        {triggeredAlerts.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-5 border border-green-100">
            <h3 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
              <i className="fa-solid fa-check-circle text-green-500"></i>
              Triggered Alerts
            </h3>
            
            <div className="space-y-2">
              {triggeredAlerts.slice(0, 5).map(alert => (
                <div key={alert.id} className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-gray-800">{alert.commodity}</div>
                      <div className="text-xs text-gray-600">
                        Reached ₹{alert.threshold}/quintal
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Educational Info */}
        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-400 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <i className="fa-solid fa-info-circle text-yellow-600 text-xl"></i>
            <div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">How Alerts Work</h4>
              <p className="text-xs text-gray-700 mb-2">
                Set alerts to monitor prices 24/7. You'll get instant browser notifications when your target price is reached.
              </p>
              <p className="text-xs text-gray-700">
                <strong>Tip:</strong> Set alerts slightly above/below your target to catch early movements!
              </p>
            </div>
          </div>
        </div>

        {/* Market Overview */}
        <div className="bg-white rounded-2xl shadow-lg p-5 border border-blue-100">
          <h3 className="font-bold text-lg mb-4 text-gray-800">Today's Market</h3>
          
          <div className="space-y-2">
            {COMMODITIES.map(comm => (
              <div key={comm.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{comm.symbol}</div>
                  <div>
                    <div className="text-sm font-bold text-gray-800">{comm.name}</div>
                    <div className="text-xs text-gray-600">₹{comm.currentPrice}/quintal</div>
                  </div>
                </div>
                <div className={`text-sm font-bold ${comm.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comm.change >= 0 ? '+' : ''}₹{comm.change}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
