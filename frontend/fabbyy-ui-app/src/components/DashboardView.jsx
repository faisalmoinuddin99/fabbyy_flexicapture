
import React from 'react';
import { Search, RefreshCw, ChevronDown, ChevronLeft, ChevronRight, Download, RotateCcw } from 'lucide-react';

const DashboardView = ({
  searchTerm,
  setSearchTerm,
  isRefreshing,
  handleRefresh,
  stats,
  filteredBatches,
  selectedBatches,
  toggleAll,
  toggleBatch,
  getStatusStyle,
  getStatusIcon,
  currentPage,
  setCurrentPage,
  onBatchClick,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Controls Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search batches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="relative">
          <button className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700">
            Date Range: Today
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.batches}</div>
          <div className="text-sm text-gray-600">Batches Today</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.documents}</div>
          <div className="text-sm text-gray-600">Documents Processed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-3xl font-bold text-emerald-600 mb-1">{stats.successRate}%</div>
          <div className="text-sm text-gray-600">Auto-Approved Success Rate</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 relative">
          {stats.needsReview > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {stats.needsReview}
            </div>
          )}
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.needsReview}</div>
          <div className="text-sm text-gray-600">Needs Review Today</div>
        </div>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedBatches.size === filteredBatches.length}
                    onChange={toggleAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Batch ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Received</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Docs</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Approved</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Review</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedBatches.has(batch.id)}
                      onChange={() => toggleBatch(batch.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => onBatchClick(batch)}
                      className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {batch.id}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{batch.received}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">{batch.docs}</td>
                  <td className="px-6 py-4 text-sm text-emerald-600 text-center font-medium">{batch.approved}</td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span className={`font-medium ${batch.review > 0 ? 'text-amber-600' : 'text-gray-400'}`}>{batch.review}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(batch.status)}`}
                    >
                      {getStatusIcon(batch.status)}
                      {batch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
            <span className="font-medium text-gray-900">28</span>
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(28, p + 1))}
            disabled={currentPage === 28}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Actions */}
      {selectedBatches.size > 0 && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4 flex items-center gap-4">
          <span className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{selectedBatches.size}</span>{' '}
            batch{selectedBatches.size !== 1 ? 'es' : ''} selected
          </span>
          <div className="flex-1" />
          <div className="relative">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Download className="w-4 h-4" />
              Export Selected
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium">
            <RotateCcw className="w-4 h-4" />
            Reprocess Selected
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
