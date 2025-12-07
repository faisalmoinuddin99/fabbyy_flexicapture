
import React, { useState, useMemo } from 'react';
import DashboardView from './components/DashboardView';
import BatchDetailView from './components/BatchDetailView';
import VerificationScreen from './components/VerificationScreen';
import SettingsPage from './components/SettingsPage';
import Header from './components/layout/Header';        // ← NEW IMPORT
import { FileText } from 'lucide-react';                // ← Removed Settings (now in Header)
// import { FileText, Settings } from 'lucide-react';

const InvoiceDashboard = ({ currentUser, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
 const [selectedBatches, setSelectedBatches] = useState(new Set());
 const [currentPage, setCurrentPage] = useState(1);
 const [isRefreshing, setIsRefreshing] = useState(false);
 const [selectedBatch, setSelectedBatch] = useState(null);
 const [activeTab, setActiveTab] = useState('all');
 const [selectedDocument, setSelectedDocument] = useState(null);
 const [showSettings, setShowSettings] = useState(false);

  const batches = [
    {
      id: 'batch_20251201_006',
      received: '2 min ago',
      receivedFull: 'Dec 01, 2025 14:23',
      processed: '14:28 (5 min)',
      docs: 18,
      approved: 16,
      review: 2,
      status: 'Partial',
      documents: [
        { id: 'INV-2025-0893', vendor: 'Acme Corp', amount: 12450.0, confidence: 98, status: 'approved' },
        { id: 'INV-2025-0894', vendor: 'Beta Systems', amount: 8720.0, confidence: 62, status: 'review' },
        { id: 'INV-2025-0895', vendor: 'Gamma Ltd', amount: 19300.0, confidence: 54, status: 'review' },
        // ... remaining documents
      ],
    },
    {
      id: 'batch_20251201_005',
      received: '15 min ago',
      receivedFull: 'Dec 01, 2025 14:08',
      processed: '14:12 (4 min)',
      docs: 8,
      approved: 8,
      review: 0,
      status: 'Success',
      documents: [
        { id: 'INV-2025-0920', vendor: 'Alpha Corp', amount: 15000.0, confidence: 99, status: 'approved' },
        // ... remaining documents
      ],
    },
    {
      id: 'batch_20251201_004',
      received: '1 hour ago',
      receivedFull: 'Dec 01, 2025 13:23',
      processed: '13:30 (7 min)',
      docs: 25,
      approved: 20,
      review: 5,
      status: 'Warning',
      documents: [],
    },
    {
      id: 'batch_20251201_001',
      received: 'Dec 01, 09:30',
      receivedFull: 'Dec 01, 2025 09:30',
      processed: '09:37 (7 min)',
      docs: 42,
      approved: 42,
      review: 0,
      status: 'Success',
      documents: [],
    },
  ];

   const stats = useMemo(() => ({ batches: 12, documents: 428, successRate: 92, needsReview: 3 }), []);

  const filteredBatches = useMemo(() =>
    batches.filter((b) => b.id.toLowerCase().includes(searchTerm.toLowerCase())),
    [searchTerm]
  );

  const filteredDocuments = useMemo(() => {
    if (!selectedBatch) return [];
    const docs = selectedBatch.documents;
    if (activeTab === 'all') return docs;
    if (activeTab === 'approved') return docs.filter((d) => d.status === 'approved');
    if (activeTab === 'review') return docs.filter((d) => d.status === 'review');
    return docs;
  }, [selectedBatch, activeTab]);

  const toggleBatch = (id) => {
    const newSelected = new Set(selectedBatches);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedBatches(newSelected);
  };

  const toggleAll = () => {
    setSelectedBatches(
      selectedBatches.size === batches.length ? new Set() : new Set(batches.map((b) => b.id))
    );
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getStatusStyle = (status) => {
    const styles = {
      Success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      Partial: 'bg-blue-50 text-blue-700 border-blue-200',
      Warning: 'bg-amber-50 text-amber-700 border-amber-200',
    };
    return styles[status] || '';
  };

  const getStatusIcon = (status) => {
    const icons = {
      Success: <FileText className="w-4 h-4" />,
      Partial: <FileText className="w-4 h-4" />,
      Warning: <FileText className="w-4 h-4" />,
    };
    return icons[status];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
     <Header
       currentUser={currentUser}
       onLogout={onLogout}
       onOpenSettings={() => setShowSettings(true)}
     />

      {selectedDocument ? (
        <VerificationScreen
          document={selectedDocument}
          batch={selectedBatch}
          onBack={() => setSelectedDocument(null)}
          onSave={() => setSelectedDocument(null)}
        />
      ) : showSettings ? (
        <SettingsPage onBack={() => setShowSettings(false)} />
      ) : selectedBatch ? (
        <BatchDetailView
          batch={selectedBatch}
          onBack={() => setSelectedBatch(null)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filteredDocuments={filteredDocuments}
          onDocumentClick={setSelectedDocument}
        />
      ) : (
        <DashboardView
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isRefreshing={isRefreshing}
          handleRefresh={handleRefresh}
          stats={stats}
          filteredBatches={filteredBatches}
          selectedBatches={selectedBatches}
          toggleAll={toggleAll}
          toggleBatch={toggleBatch}
          getStatusStyle={getStatusStyle}
          getStatusIcon={getStatusIcon}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onBatchClick={setSelectedBatch}
        />
      )}
    </div>
  );
};

export default InvoiceDashboard;
