'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';

export default function Module2Page() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8">
        <div className="max-w-md mx-auto px-4">
          <Link href="/learn-hedging" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Learning Path</span>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-semibold mb-3">
                Level 2
              </div>
              <h1 className="text-3xl font-bold mb-2">Module 2: Know Your Markets</h1>
              <p className="text-green-100 text-base">Understanding what moves oilseed prices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h2>
            <p className="text-gray-600 mb-6">
              This module is currently under development. Check back soon!
            </p>
            <div className="space-y-2 text-left bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Topics to be covered:</h3>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>What moves oilseed prices</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>When to watch prices</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Reading crop reports</span>
              </div>
            </div>
            <Link 
              href="/learn-hedging"
              className="inline-block mt-6 bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-lg transition-all"
            >
              Back to Learning Path
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
