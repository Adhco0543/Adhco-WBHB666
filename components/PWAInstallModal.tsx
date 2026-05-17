'use client';

import { Download, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { isPWAInstallable, requestPWAInstall } from '@/lib/pwa';

export function PWAInstallModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    if (isPWAInstallable()) {
      setInstallable(true);
      // Show modal after 30 seconds of use
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  const handleInstall = async () => {
    try {
      const success = await requestPWAInstall();
      if (success) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm mx-4 p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Download className="text-blue-600" size={28} />
            <h2 className="text-xl font-bold text-gray-900">Install App</h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600">
          Install ADHCO as an app on your device for faster access and offline support.
        </p>

        <ul className="space-y-2 text-sm text-gray-600">
          <li>✓ Quick access from home screen</li>
          <li>✓ Works offline</li>
          <li>✓ Full-screen experience</li>
        </ul>

        <div className="flex gap-3 pt-4">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Not Now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
