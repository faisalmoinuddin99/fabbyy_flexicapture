
import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, FileText, TrendingUp, CheckCircle, AlertTriangle, RotateCcw, Upload, RefreshCw, ExternalLink, Database } from 'lucide-react';
import DocumentCard from './DocumentCard';

const BatchDetailView = ({
  batch,
  onBack,
  activeTab,
  setActiveTab,
  filteredDocuments,
  onDocumentClick,
}) => {
  const [exportDestinations] = useState([
    {
      id: 1,
      name: 'CSV Daily Export',
      status: 'Success',
      lastExport: '2025-12-01 02:01',
      type: 'CSV',
    },
    {
      id: 2,
      name: 'SQL Server (benlux-dev-cvx)',
      status: 'Success',
      lastExport: '2025-12-01 14:35',
      type: 'SQL',
    },
    {
      id: 3,
      name: 'Power Apps Flow',
      status: 'Success',
      lastExport: '2025-12-01 14:35',
      type: 'PowerApps',
    },
  ]);

  const [exporting, setExporting] = useState(false);

  const handleExportNow = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert('Batch exported successfully!');
    }, 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Back Button & Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Batches</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Batch {batch.id}</h2>
          </div>
          <div
            className={`px-4 py-2 rounded-lg border ${
              batch.status === 'Success'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : batch.status === 'Partial'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            <span className="font-semibold">Status: {batch.status}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div className="text-xs font-medium text-gray-500 uppercase">Received</div>
          </div>
          <div className="text-lg font-semibold text-gray-900">{batch.receivedFull}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <div className="text-xs font-medium text-gray-500 uppercase">Processed</div>
          </div>
          <div className="text-lg font-semibold text-gray-900">{batch.processed}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <div className="text-xs font-medium text-gray-500 uppercase">Total Docs</div>
          </div>
          <div className="text-lg font-semibold text-gray-900">{batch.docs}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <div className="text-xs font-medium text-gray-500 uppercase">Status</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-emerald-600">{batch.approved}</span>
            <span className="text-sm text-gray-400">Approved</span>
            <span className="text-lg font-semibold text-amber-600">{batch.review}</span>
            <span className="text-sm text-gray-400">Review</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            {['all', 'approved', 'review', 'history', 'export'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab === 'all' && `All (${batch.docs})`}
                {tab === 'approved' && `Auto-Approved (${batch.approved})`}
                {tab === 'review' && `Needs Review (${batch.review})`}
                {tab === 'history' && 'History'}
                {tab === 'export' && 'Export'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'export' ? (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export History & Options</h3>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Destination</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Export</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {exportDestinations.map((dest) => (
                    <tr key={dest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {dest.type === 'CSV' && <FileText className="w-4 h-4 text-gray-400" />}
                          {dest.type === 'SQL' && <Database className="w-4 h-4 text-gray-400" />}
                          {dest.type === 'PowerApps' && <ExternalLink className="w-4 h-4 text-gray-400" />}
                          <span className="text-sm font-medium text-gray-900">{dest.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            dest.status === 'Success'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {dest.status === 'Success' ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                          {dest.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dest.lastExport}</td>
                      <td className="px-6 py-4">
                        {dest.status === 'Success' ? (
                          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">View</button>
                        ) : (
                          <button className="text-sm text-amber-600 hover:text-amber-800 font-medium flex items-center gap-1">
                            <RotateCcw className="w-3 h-3" />
                            Retry
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={handleExportNow}
              disabled={exporting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {exporting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Export This Batch Now
                </>
              )}
            </button>
          </div>
        ) : activeTab !== 'history' ? (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentCard key={doc.id} document={doc} onClick={() => onDocumentClick(doc)} />
              ))}
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">History view coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BatchDetailView;
