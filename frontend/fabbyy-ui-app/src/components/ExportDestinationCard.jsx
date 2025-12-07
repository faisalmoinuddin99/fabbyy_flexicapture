
import React from 'react';
import { Database, ExternalLink, RefreshCw, CheckCircle, Save, Trash2 } from 'lucide-react';

const ExportDestinationCard = ({
  destination,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onUpdate,
  onTest,
  testingExport,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            {destination.type === 'SQL Server' ? (
              <Database className="w-5 h-5 text-blue-600" />
            ) : (
              <ExternalLink className="w-5 h-5 text-blue-600" />
            )}
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={destination.name}
                onChange={(e) => onUpdate('name', e.target.value)}
                className="text-lg font-semibold text-gray-900 border-b-2 border-blue-600 focus:outline-none"
              />
            ) : (
              <h4 className="text-lg font-semibold text-gray-900">{destination.name}</h4>
            )}
            <p className="text-sm text-gray-500">{destination.type}</p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            destination.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {destination.status}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-4 mb-6">
        {/* Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
          {isEditing ? (
            <select
              value={destination.type}
              onChange={(e) => onUpdate('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>SQL Server</option>
              <option>Power Automate</option>
              <option>CSV Export</option>
              <option>REST API</option>
            </select>
          ) : (
            <p className="text-gray-900">{destination.type}</p>
          )}
        </div>

        {/* SQL Server Fields */}
        {destination.type === 'SQL Server' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Connection String</label>
              {isEditing ? (
                <input
                  type="text"
                  value={destination.connectionString}
                  onChange={(e) => onUpdate('connectionString', e.target.value)}
                  placeholder="Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              ) : (
                <p className="text-gray-900 font-mono text-sm">{destination.connectionString}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Target Table</label>
              {isEditing ? (
                <input
                  type="text"
                  value={destination.targetTable}
                  onChange={(e) => onUpdate('targetTable', e.target.value)}
                  placeholder="dbo.IncomingInvoices"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{destination.targetTable}</p>
              )}
            </div>

            {/* Test Connection */}
            <div className="flex gap-3">
              <button
                onClick={onTest}
                disabled={testingExport}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                  destination.lastTest === 'Success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {testingExport ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : destination.lastTest === 'Success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Connection Success
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">On Success</label>
              {isEditing ? (
                <select
                  value={destination.onSuccess}
                  onChange={(e) => onUpdate('onSuccess', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Mark batch as "Exported"</option>
                  <option>Archive documents</option>
                  <option>Do nothing</option>
                </select>
              ) : (
                <p className="text-gray-900">{destination.onSuccess}</p>
              )}
            </div>
          </>
        )}

        {/* Power Automate Fields */}
        {destination.type === 'Power Automate' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Webhook URL</label>
              {isEditing ? (
                <input
                  type="text"
                  value={destination.webhookUrl}
                  onChange={(e) => onUpdate('webhookUrl', e.target.value)}
                  placeholder="https://prod-123.logic.azure.com/workflows/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              ) : (
                <p className="text-gray-900 font-mono text-sm break-all">{destination.webhookUrl}</p>
              )}
            </div>

            {/* Test Webhook */}
            <div className="flex gap-3">
              <button
                onClick={onTest}
                disabled={testingExport}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                  destination.lastTest === 'Success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {testingExport ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : destination.lastTest === 'Success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Webhook Success
                  </>
                ) : (
                  'Test Webhook'
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        {isEditing ? (
          <>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={onDelete}
              className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 text-sm font-medium flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </>
        ) : (
          <button
            onClick={onEdit}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default ExportDestinationCard;
