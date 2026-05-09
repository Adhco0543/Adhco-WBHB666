'use client';

import { useState } from 'react';
import { WorkspaceProject, ProjectQuote, ProjectMaterial } from '@/lib/workspaceTypes';
import {
  generateQuoteHTML,
  generateMaterialsHTML,
  generateQuoteJSON,
  generateMaterialsCSV,
  generateEmailDraft,
  copyToClipboard,
  downloadFile,
} from '@/lib/exportShare';

interface ExportShareMenuProps {
  project: WorkspaceProject;
  quote?: ProjectQuote;
  materials?: ProjectMaterial[];
  onExportComplete?: (format: string) => void;
}

export function ExportShareMenu({
  project,
  quote,
  materials = [],
  onExportComplete,
}: ExportShareMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      if (format === 'quote-html' && quote) {
        const html = generateQuoteHTML(quote, project);
        await downloadFile(
          html,
          `${project.title}-quote.html`,
          'text/html'
        );
      } else if (format === 'materials-html' && materials.length > 0) {
        const html = generateMaterialsHTML(materials[0], project);
        await downloadFile(
          html,
          `${project.title}-materials.html`,
          'text/html'
        );
      } else if (format === 'quote-json' && quote) {
        const json = generateQuoteJSON(quote, project);
        await downloadFile(
          JSON.stringify(json, null, 2),
          `${project.title}-quote.json`,
          'application/json'
        );
      } else if (format === 'materials-csv' && materials.length > 0) {
        const csv = generateMaterialsCSV(materials[0]);
        await downloadFile(
          csv,
          `${project.title}-materials.csv`,
          'text/csv'
        );
      } else if (format === 'email-draft' && quote) {
        const emailText = generateEmailDraft(quote, project);
        await copyToClipboard(emailText);
        setLastAction('email-draft');
        setTimeout(() => setLastAction(null), 2000);
      } else if (format === 'copy-quote' && quote) {
        const html = generateQuoteHTML(quote, project);
        await copyToClipboard(html);
        setLastAction('copy-quote');
        setTimeout(() => setLastAction(null), 2000);
      }

      if (onExportComplete) {
        onExportComplete(format);
      }

      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <span>📤</span>
        {isExporting ? 'Exporting...' : 'Export & Share'}
        <span className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-2 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-700 px-3 py-2">EXPORT OPTIONS</p>
          </div>

          <div className="p-2 space-y-1">
            {/* Quote Exports */}
            {quote && (
              <>
                <button
                  onClick={() => handleExport('quote-html')}
                  className="w-full text-left px-3 py-2.5 rounded hover:bg-blue-50 transition-colors group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📄</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Download as HTML</p>
                      <p className="text-xs text-gray-500">Professional formatted document</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('quote-json')}
                  className="w-full text-left px-3 py-2.5 rounded hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">💾</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Export as JSON</p>
                      <p className="text-xs text-gray-500">Structured data format</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('copy-quote')}
                  className="w-full text-left px-3 py-2.5 rounded hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📋</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {lastAction === 'copy-quote' ? 'Copied!' : 'Copy to Clipboard'}
                      </p>
                      <p className="text-xs text-gray-500">Paste in emails or documents</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('email-draft')}
                  className="w-full text-left px-3 py-2.5 rounded hover:bg-blue-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📧</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {lastAction === 'email-draft' ? 'Copied!' : 'Email Template'}
                      </p>
                      <p className="text-xs text-gray-500">Ready-to-send message</p>
                    </div>
                  </div>
                </button>
              </>
            )}

            {/* Materials Exports */}
            {materials.length > 0 && (
              <>
                {quote && <div className="my-2 border-t border-gray-100" />}

                <button
                  onClick={() => handleExport('materials-html')}
                  className="w-full text-left px-3 py-2.5 rounded hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">🗂️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Materials as HTML</p>
                      <p className="text-xs text-gray-500">Formatted table</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('materials-csv')}
                  className="w-full text-left px-3 py-2.5 rounded hover:bg-green-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📊</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Materials as CSV</p>
                      <p className="text-xs text-gray-500">Excel / Spreadsheet ready</p>
                    </div>
                  </div>
                </button>
              </>
            )}

            {!quote && materials.length === 0 && (
              <div className="px-3 py-4 text-center">
                <p className="text-sm text-gray-500">
                  No quote or materials to export yet
                </p>
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 px-3 py-2">
              More formats coming soon: PDF, Word, Spreadsheet
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
