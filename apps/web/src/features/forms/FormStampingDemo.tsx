import React, { useState } from 'react';
import { FormManager } from './components/FormManager';
import type { StampResult, FormTemplate, FormContent } from './types';
import formTemplatesData from './data/formTemplates.json';
import formTextsData from '../../data/form_texts.json';

// Cast imported JSON to proper types
const formTemplates = formTemplatesData as FormTemplate[];
const formTexts = formTextsData as FormContent[];

/**
 * Demo component to test and showcase the Form Stamping System
 * Can be integrated into the main app for testing or used as a standalone demo
 */
export const FormStampingDemo: React.FC = () => {
  const [concentration, setConcentration] = useState(1.0);
  const [showDebug, setShowDebug] = useState(false);
  const [stampCount, setStampCount] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [lastResult, setLastResult] = useState<StampResult | null>(null);

  const handleStamp = (result: StampResult) => {
    setLastResult(result);
    setStampCount((prev) => prev + 1);
    if (result.success) {
      setSuccessCount((prev) => prev + 1);
    }
    console.log('Stamp result:', result);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bürokratie der Unendlichkeit
          </h1>
          <h2 className="text-2xl text-gray-700">Form Stamping System Demo</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Controls Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Statistics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Statistics
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Stamps:</span>
                  <span className="font-bold">{stampCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Successful:</span>
                  <span className="font-bold text-green-600">{successCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-bold">
                    {stampCount > 0
                      ? `${Math.round((successCount / stampCount) * 100)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Concentration Control */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Controls
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konzentration: {Math.round(concentration * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={concentration}
                    onChange={(e) => setConcentration(parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="debug"
                    checked={showDebug}
                    onChange={(e) => setShowDebug(e.target.checked)}
                    className="mr-2"
                  />
                  <label htmlFor="debug" className="text-sm text-gray-700">
                    Show Stamp Field (Debug)
                  </label>
                </div>
              </div>
            </div>

            {/* Last Result */}
            {lastResult && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  Last Stamp
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`font-bold ${
                        lastResult.success ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {lastResult.success ? '✓ Approved' : '✗ Failed'}
                    </span>
                  </div>
                  {lastResult.success && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Accuracy:</span>
                      <span className="font-bold">
                        {Math.round(lastResult.accuracy * 100)}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-mono text-xs">
                      {lastResult.type}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-blue-900">
                Instructions
              </h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Click on the stamp field to approve forms</li>
                <li>• Low concentration causes smudges</li>
                <li>• Missing the field leaves coffee stains</li>
                <li>• Failed stamps can be retried</li>
              </ul>
            </div>
          </div>

          {/* Form Display Area */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-2xl overflow-hidden">
            <div className="h-[800px] bg-gradient-to-br from-amber-50 to-yellow-50">
              <FormManager
                templates={formTemplates}
                contents={formTexts}
                onStamp={handleStamp}
                concentration={concentration}
                showDebug={showDebug}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Form Stamping System • Version 1.0 • Bürokratie der Unendlichkeit
          </p>
        </div>
      </div>
    </div>
  );
};
