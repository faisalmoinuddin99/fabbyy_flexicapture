
import React, { useState } from 'react';
import { ArrowLeft, Mail, Key, Database, Bell, Users, Upload, Plus } from 'lucide-react';
import EmailAccountCard from './EmailAccountCard';
import ExportDestinationCard from './ExportDestinationCard';

const SettingsPage = ({ onBack }) => {
  const [activeSettingsTab, setActiveSettingsTab] = useState('email');
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

  // Email Account Handlers
  const handleAddAccount = () => {
    const newAccount = {
      id: emailAccounts.length + 1,
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
    setEmailAccounts(
      emailAccounts.map((acc) => (acc.id === id ? { ...acc, [field]: value } : acc))
    );
  };

  const handleTestConnection = (id) => {
    setTestingConnection(true);
    setTimeout(() => {
      setEmailAccounts(
        emailAccounts.map((acc) =>
          acc.id === id ? { ...acc, lastTest: 'Success', status: 'Active' } : acc
        )
      );
      setTestingConnection(false);
    }, 1500);
  };

  // Export Destination Handlers
  const handleAddExportDestination = () => {
    const newDest = {
      id: exportDestinations.length + 1,
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
    setExportDestinations(
      exportDestinations.map((dest) => (dest.id === id ? { ...dest, [field]: value } : dest))
    );
  };

  const handleTestExport = (id) => {
    setTestingExport(true);
    setTimeout(() => {
      setExportDestinations(
        exportDestinations.map((dest) =>
          dest.id === id ? { ...dest, lastTest: 'Success', status: 'Active' } : dest
        )
      );
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
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { key: 'email', label: 'Email Accounts', icon: <Mail className="w-4 h-4" /> },
              { key: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
              { key: 'storage', label: 'Storage', icon: <Database className="w-4 h-4" /> },
              { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
              { key: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
              { key: 'exports', label: 'Export Destinations', icon: <Upload className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveSettingsTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
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
              onUpdate={(field, value) => handleUpdateAccount(account.id, field, value)}
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
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
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
              onUpdate={(field, value) => handleUpdateExportDestination(destination.id, field, value)}
              onTest={() => handleTestExport(destination.id)}
              testingExport={testingExport}
            />
          ))}
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeSettingsTab !== 'email' && activeSettingsTab !== 'exports' && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeSettingsTab === 'api' && <Key className="w-8 h-8 text-gray-400" />}
            {activeSettingsTab === 'storage' && <Database className="w-8 h-8 text-gray-400" />}
            {activeSettingsTab === 'notifications' && <Bell className="w-8 h-8 text-gray-400" />}
            {activeSettingsTab === 'users' && <Users className="w-8 h-8 text-gray-400" />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {activeSettingsTab === 'api' && 'API Keys'}
            {activeSettingsTab === 'storage' && 'Storage Settings'}
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
