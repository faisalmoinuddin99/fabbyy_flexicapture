
import React from 'react';
import { Mail, RefreshCw, CheckCircle, Save, Trash2 } from 'lucide-react';

const EmailAccountCard = ({
  account,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onUpdate,
  onTest,
  testingConnection,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={account.accountName}
                onChange={(e) => onUpdate('accountName', e.target.value)}
                className="text-lg font-semibold text-gray-900 border-b-2 border-blue-600 focus:outline-none"
              />
            ) : (
              <h4 className="text-lg font-semibold text-gray-900">{account.accountName}</h4>
            )}
            <p className="text-sm text-gray-500">
              {account.protocol} - {account.host}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            account.status === 'Active'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}
        >
          {account.status}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Protocol & Poll Interval */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Protocol</label>
              {isEditing ? (
                <select
                  value={account.protocol}
                  onChange={(e) => onUpdate('protocol', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>IMAP</option>
                  <option>POP3</option>
                </select>
              ) : (
                <p className="text-gray-900">{account.protocol}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Poll Every</label>
              {isEditing ? (
                <select
                  value={account.pollInterval}
                  onChange={(e) => onUpdate('pollInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 sec</option>
                  <option value={30}>30 sec</option>
                  <option value={60}>1 min</option>
                  <option value={300}>5 min</option>
                </select>
              ) : (
                <p className="text-gray-900">{account.pollInterval} sec</p>
              )}
            </div>
          </div>

          {/* Host & Port */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Host</label>
              {isEditing ? (
                <input
                  type="text"
                  value={account.host}
                  onChange={(e) => onUpdate('host', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{account.host}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Port</label>
              {isEditing ? (
                <input
                  type="number"
                  value={account.port}
                  onChange={(e) => onUpdate('port', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{account.port}</p>
              )}
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
            {isEditing ? (
              <input
                type="email"
                value={account.username}
                onChange={(e) => onUpdate('username', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{account.username}</p>
            )}
          </div>

          {/* Password + Test Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
            <div className="flex gap-2">
              {isEditing ? (
                <input
                  type="password"
                  value={account.password}
                  onChange={(e) => onUpdate('password', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="flex-1 text-gray-900">{account.password}</p>
              )}
              <button
                onClick={onTest}
                disabled={testingConnection}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                  account.lastTest === 'Success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : account.lastTest === 'Success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Success
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Folder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Folder</label>
            {isEditing ? (
              <input
                type="text"
                value={account.folder}
                onChange={(e) => onUpdate('folder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{account.folder}</p>
            )}
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject Contains</label>
            {isEditing ? (
              <input
                type="text"
                value={account.subjectContains}
                onChange={(e) => onUpdate('subjectContains', e.target.value)}
                placeholder="invoice bill statement"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{account.subjectContains}</p>
            )}
          </div>

          {/* Download Folder */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Download Folder</label>
            {isEditing ? (
              <input
                type="text"
                value={account.downloadFolder}
                onChange={(e) => onUpdate('downloadFolder', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-gray-900">{account.downloadFolder}</p>
            )}
          </div>

          {/* Archive After */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={account.archiveAfter}
                onChange={(e) => onUpdate('archiveAfter', e.target.checked)}
                disabled={!isEditing}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Archive After Processing</span>
            </label>
          </div>
        </div>
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

export default EmailAccountCard;
