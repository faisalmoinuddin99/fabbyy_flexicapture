
import React from 'react';
import { FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const DocumentCard = ({ document, onClick }) => {
  const isApproved = document.status === 'approved';
  const confidenceColor =
    document.confidence >= 90
      ? 'text-emerald-600'
      : document.confidence >= 70
      ? 'text-amber-600'
      : 'text-red-600';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
    >
      {/* PDF Thumbnail */}
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-48 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 opacity-50"></div>
        <FileText className="w-16 h-16 text-gray-400 relative z-10" />
        <div className="absolute top-3 right-3">
          {isApproved ? (
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          ) : (
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{document.id}</h3>
        <p className="text-sm text-gray-600 mb-3">{document.vendor}</p>
        <p className="text-2xl font-bold text-gray-900 mb-3">
          $
          {document.amount.toLocaleString('en-US', {
            minimumFractionDigits: 2,
          })}
        </p>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">Confidence</p>
            <p className={`text-lg font-semibold ${confidenceColor}`}>{document.confidence}%</p>
          </div>

          {!isApproved && (
            <div className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium border border-red-200">
              Needs Review
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
