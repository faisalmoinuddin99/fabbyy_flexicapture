import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail, Key, Database, Bell, Users, Upload, Plus, FolderOpen, Check, AlertCircle } from 'lucide-react';
import EmailAccountCard from './EmailAccountCard';
import ExportDestinationCard from './ExportDestinationCard';

const SettingsPage = ({ onBack }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('email');

  // Email & Export state (unchanged)
  const [emailAccounts, setEmailAccounts] = useState([
    {
      id: 1,
      accountName: 'Gmail Invoices',
      protocol: 'IMAP',
      host: 'imap.gmail.com',
      port: 993,
      username: 'invoices@acme.com',
      password: '••••••••••••',
      folder: 'INBOX',
      subjectContains: 'invoice bill statement',
      downloadFolder: '/var/invoices/gmail',
      pollInterval: 30,
      archiveAfter: true,
      status: 'Active',
      lastTest: 'Success',
    },
  ]);

  const [exportDestinations, setExportDestinations] = useState([
    {
      id: 1,
      name: 'Production SQL',
      type: 'SQL Server',
      connectionString: 'Server=prod-sql;Database=Invoices;••••',
      targetTable: 'dbo.IncomingInvoices',
      onSuccess: 'Mark batch as "Exported"',
      status: 'Active',
      lastTest: 'Success',
    },
    {
      id: 2,
      name: 'Power Apps Flow',
      type: 'Power Automate',
      webhookUrl: 'https://prod-123.logic.azure.com/workflows/••••',
      status: 'Active',
      lastTest: 'Success',
    },
  ]);

  const [editingAccount, setEditingAccount] = useState(null);
  const [testingConnection, setTestingConnection] = useState(false);
  const [editingExport, setEditingExport] = useState(null);
  const [testingExport, setTestingExport] = useState(false);

  // === NEW: Hot Folder State ===
  const [hotFolderPath, setHotFolderPath] = useState('');
  const [currentHotFolderPath, setCurrentHotFolderPath] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // success | error

  // Fetch settings on mount
  useEffect(() => {
    fetch('http://localhost:8000/api/settings')
      .then(res => res.json())
      .then(data => {
        setHotFolderPath(data.hotFolderPath);
        setCurrentHotFolderPath(data.hotFolderPath);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Failed to load settings:', err);
        setMessage({ text: 'Could not connect to backend', type: 'error' });
        setIsLoading(false);
      });
  }, []);

  const handleSaveHotFolder = async () => {
    if (!hotFolderPath.trim()) {
      setMessage({ text: 'Path cannot be empty', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('http://localhost:8000/api/settings/hot-folder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotFolderPath: hotFolderPath.trim() })
      });

      if (res.ok) {
        const result = await res.json();
        setCurrentHotFolderPath(result.hotFolderPath);
        setMessage({ text: 'Hot folder updated successfully! Watcher restarted.', type: 'success' });
      } else {
        const error = await res.json();
        setMessage({ text: error.detail || 'Failed to update hot folder', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Network error. Is the backend running?', type: 'error' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 6000);
    }
  };

  // === Existing Handlers (Email & Export) ===
  const handleAddAccount = () => {
    const newAccount = {
      id: Date.now(),
      accountName: 'New Account',
      protocol: 'IMAP',
      host: '',
      port: 993,
      username: '',
      password: '',
      folder: 'INBOX',
      subjectContains: '',
      downloadFolder: '',
      pollInterval: 30,
      archiveAfter: false,
      status: 'Inactive',
      lastTest: null,
    };
    setEmailAccounts([...emailAccounts, newAccount]);
    setEditingAccount(newAccount.id);
  };

  const handleDeleteAccount = (id) => {
    setEmailAccounts(emailAccounts.filter((acc) => acc.id !== id));
    if (editingAccount === id) setEditingAccount(null);
  };

  const handleUpdateAccount = (id, field, value) => {
    setEmailAccounts(emailAccounts.map((acc) => (acc.id === id ? { ...acc, [field]: value } : acc)));
  };

  const handleTestConnection = (id) => {
    setTestingConnection(true);
    setTimeout(() => {
      setEmailAccounts(emailAccounts.map((acc) =>
        acc.id === id ? { ...acc, lastTest: 'Success', status: 'Active' } : acc
      ));
      setTestingConnection(false);
    }, 1500);
  };

  const handleAddExportDestination = () => {
    const newDest = {
      id: Date.now(),
      name: 'New Export Destination',
      type: 'SQL Server',
      connectionString: '',
      targetTable: '',
      onSuccess: 'Mark batch as "Exported"',
      status: 'Inactive',
      lastTest: null,
    };
    setExportDestinations([...exportDestinations, newDest]);
    setEditingExport(newDest.id);
  };

  const handleDeleteExportDestination = (id) => {
    setExportDestinations(exportDestinations.filter((dest) => dest.id !== id));
    if (editingExport === id) setEditingExport(null);
  };

  const handleUpdateExportDestination = (id, field, value) => {
    setExportDestinations(exportDestinations.map((dest) =>
      dest.id === id ? { ...dest, [field]: value } : dest
    ));
  };

  const handleTestExport = (id) => {
    setTestingExport(true);
    setTimeout(() => {
      setExportDestinations(exportDestinations.map((dest) =>
        dest.id === id ? { ...dest, lastTest: 'Success', status: 'Active' } : dest
      ));
      setTestingExport(false);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6 shadow-sm">
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap">
            {[
              { key: 'email', label: 'Email Accounts', icon: <Mail className="w-4 h-4" /> },
              { key: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
              { key: 'storage', label: 'Hot Folder', icon: <Database className="w-4 h-4" /> },
              { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
              { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
              { key: 'exports', label: 'Export Destinations', icon: <Upload className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSettingsTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                  activeSettingsTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Email Accounts Tab */}
      {activeSettingsTab === 'email' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Email Accounts</h3>
            <button
              onClick={handleAddAccount}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Add New Account
            </button>
          </div>

          {emailAccounts.map((account) => (
            <EmailAccountCard
              key={account.id}
              account={account}
              isEditing={editingAccount === account.id}
              onEdit={() => setEditingAccount(account.id)}
              onSave={() => setEditingAccount(null)}
              onDelete={() => handleDeleteAccount(account.id)}
              onUpdate={(f, v) => handleUpdateAccount(account.id, f, v)}
              onTest={() => handleTestConnection(account.id)}
              testingConnection={testingConnection}
            />
          ))}
        </div>
      )}

      {/* Export Destinations Tab */}
      {activeSettingsTab === 'exports' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Export Destinations</h3>
            <button
              onClick={handleAddExportDestination}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Add Export Destination
            </button>
          </div>

          {exportDestinations.map((destination) => (
            <ExportDestinationCard
              key={destination.id}
              destination={destination}
              isEditing={editingExport === destination.id}
              onEdit={() => setEditingExport(destination.id)}
              onSave={() => setEditingExport(null)}
              onDelete={() => handleDeleteExportDestination(destination.id)}
              onUpdate={(f, v) => handleUpdateExportDestination(destination.id, f, v)}
              onTest={() => handleTestExport(destination.id)}
              testingExport={testingExport}
            />
          ))}
        </div>
      )}

      {/* STORAGE TAB - HOT FOLDER */}
      {activeSettingsTab === 'storage' && (
        <div className="max-w-4xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Storage & Processing</h3>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-medium text-gray-900">Hot Folder Location</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Drop PDF invoices here to trigger automatic processing
                </p>
              </div>
            </div>

            {isLoading ? (
              <p className="text-gray-500">Loading settings...</p>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <input
                    type="text"
                    value={hotFolderPath}
                    onChange={(e) => setHotFolderPath(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    placeholder="/Users/yourname/invoices_hot_folder"
                  />
                  <button
                    onClick={handleSaveHotFolder}
                    disabled={saving || hotFolderPath.trim() === currentHotFolderPath}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition flex items-center gap-2 justify-center"
                  >
                    {saving ? (
                      <>Saving...</>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>
                    <span className="font-medium">Current path:</span>{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                      {currentHotFolderPath || 'Not set'}
                    </code>
                  </p>
                  {hotFolderPath.trim() !== currentHotFolderPath && (
                    <p className="text-amber-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      You have unsaved changes
                    </p>
                  )}
                </div>

                {message.text && (
                  <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {message.type === 'success' ? (
                      <Check className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="font-medium">{message.text}</span>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-8 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
            <p>
              <strong>Tip:</strong> You can create a desktop shortcut or alias to this folder for quick access.
            </p>
          </div>
        </div>
      )}

      {/* Placeholder for other tabs */}
      {['api', 'notifications', 'users'].includes(activeSettingsTab) && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeSettingsTab === 'api' && <Key className="w-8 h-8 text-gray-400" />}
            {activeSettingsTab === 'notifications' && <Bell className="w-8 h-8 text-gray-400" />}
            {activeSettingsTab === 'users' && <Users className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeSettingsTab === 'api' && 'API Keys'}
            {activeSettingsTab === 'notifications' && 'Notification Settings'}
            {activeSettingsTab === 'users' && 'User Management'}
          </h3>
          <p className="text-gray-500">Coming soon</p>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;