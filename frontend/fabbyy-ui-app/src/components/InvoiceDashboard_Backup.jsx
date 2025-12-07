
// import React, { useState, useMemo } from 'react';
// import DashboardView from './DashboardView';
// import BatchDetailView from './BatchDetailView';
// import VerificationScreen from './VerificationScreen';
// import SettingsPage from './SettingsPage';
// import { FileText, Settings } from 'lucide-react';

// const InvoiceDashboard = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedBatches, setSelectedBatches] = useState(new Set());
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [selectedBatch, setSelectedBatch] = useState(null);
//   const [activeTab, setActiveTab] = useState('all');
//   const [selectedDocument, setSelectedDocument] = useState(null);
//   const [showSettings, setShowSettings] = useState(false);

//   const batches = [
//     {
//       id: 'batch_20251201_006',
//       received: '2 min ago',
//       receivedFull: 'Dec 01, 2025 14:23',
//       processed: '14:28 (5 min)',
//       docs: 18,
//       approved: 16,
//       review: 2,
//       status: 'Partial',
//       documents: [
//         { id: 'INV-2025-0893', vendor: 'Acme Corp', amount: 12450.0, confidence: 98, status: 'approved' },
//         { id: 'INV-2025-0894', vendor: 'Beta Systems', amount: 8720.0, confidence: 62, status: 'review' },
//         { id: 'INV-2025-0895', vendor: 'Gamma Ltd', amount: 19300.0, confidence: 54, status: 'review' },
//         // ... remaining documents
//       ],
//     },
//     {
//       id: 'batch_20251201_005',
//       received: '15 min ago',
//       receivedFull: 'Dec 01, 2025 14:08',
//       processed: '14:12 (4 min)',
//       docs: 8,
//       approved: 8,
//       review: 0,
//       status: 'Success',
//       documents: [
//         { id: 'INV-2025-0920', vendor: 'Alpha Corp', amount: 15000.0, confidence: 99, status: 'approved' },
//         // ... remaining documents
//       ],
//     },
//     {
//       id: 'batch_20251201_004',
//       received: '1 hour ago',
//       receivedFull: 'Dec 01, 2025 13:23',
//       processed: '13:30 (7 min)',
//       docs: 25,
//       approved: 20,
//       review: 5,
//       status: 'Warning',
//       documents: [],
//     },
//     {
//       id: 'batch_20251201_001',
//       received: 'Dec 01, 09:30',
//       receivedFull: 'Dec 01, 2025 09:30',
//       processed: '09:37 (7 min)',
//       docs: 42,
//       approved: 42,
//       review: 0,
//       status: 'Success',
//       documents: [],
//     },
//   ];

//   const stats = useMemo(() => ({
//     batches: 12,
//     documents: 428,
//     successRate: 92,
//     needsReview: 3,
//   }), []);

//   const filteredBatches = useMemo(() =>
//     batches.filter((b) => b.id.toLowerCase().includes(searchTerm.toLowerCase())),
//     [searchTerm]
//   );

//   const filteredDocuments = useMemo(() => {
//     if (!selectedBatch) return [];
//     const docs = selectedBatch.documents;
//     if (activeTab === 'all') return docs;
//     if (activeTab === 'approved') return docs.filter((d) => d.status === 'approved');
//     if (activeTab === 'review') return docs.filter((d) => d.status === 'review');
//     return docs;
//   }, [selectedBatch, activeTab]);

//   const toggleBatch = (id) => {
//     const newSelected = new Set(selectedBatches);
//     newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
//     setSelectedBatches(newSelected);
//   };

//   const toggleAll = () => {
//     setSelectedBatches(
//       selectedBatches.size === batches.length ? new Set() : new Set(batches.map((b) => b.id))
//     );
//   };

//   const handleRefresh = () => {
//     setIsRefreshing(true);
//     setTimeout(() => setIsRefreshing(false), 1000);
//   };

//   const getStatusStyle = (status) => {
//     const styles = {
//       Success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//       Partial: 'bg-blue-50 text-blue-700 border-blue-200',
//       Warning: 'bg-amber-50 text-amber-700 border-amber-200',
//     };
//     return styles[status] || '';
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       Success: <FileText className="w-4 h-4" />,
//       Partial: <FileText className="w-4 h-4" />,
//       Warning: <FileText className="w-4 h-4" />,
//     };
//     return icons[status];
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
//         <div className="px-6 py-4 flex items-center justify-between">
//           <div className="flex items-center gap-8">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
//                 <FileText className="w-6 h-6 text-white" />
//               </div>
//               <h1 className="text-xl font-semibold text-gray-900">FABBYY FLEXICAPTURE</h1>
//             </div>
//           </div>
//           <div className="flex items-center gap-4">
//             <span className="text-sm text-gray-600">
//               Hi, <span className="font-medium text-gray-900">Faisal Suleman</span>
//             </span>
//             <button
//               onClick={() => setShowSettings(!showSettings)}
//               className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//             >
//               <Settings className="w-5 h-5 text-gray-600" />
//             </button>
//             <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
//               FS
//             </div>
//           </div>
//         </div>
//       </header>

//       {selectedDocument ? (
//         <VerificationScreen
//           document={selectedDocument}
//           batch={selectedBatch}
//           onBack={() => setSelectedDocument(null)}
//           onSave={() => setSelectedDocument(null)}
//         />
//       ) : showSettings ? (
//         <SettingsPage onBack={() => setShowSettings(false)} />
//       ) : selectedBatch ? (
//         <BatchDetailView
//           batch={selectedBatch}
//           onBack={() => setSelectedBatch(null)}
//           activeTab={activeTab}
//           setActiveTab={setActiveTab}
//           filteredDocuments={filteredDocuments}
//           onDocumentClick={setSelectedDocument}
//         />
//       ) : (
//         <DashboardView
//           searchTerm={searchTerm}
//           setSearchTerm={setSearchTerm}
//           isRefreshing={isRefreshing}
//           handleRefresh={handleRefresh}
//           stats={stats}
//           filteredBatches={filteredBatches}
//           selectedBatches={selectedBatches}
//           toggleAll={toggleAll}
//           toggleBatch={toggleBatch}
//           getStatusStyle={getStatusStyle}
//           getStatusIcon={getStatusIcon}
//           currentPage={currentPage}
//           setCurrentPage={setCurrentPage}
//           onBatchClick={setSelectedBatch}
//         />
//       )}
//     </div>
//   );
// };

// export default InvoiceDashboard;
import React, { useState, useMemo } from 'react';
import {
  Search,
  RefreshCw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  RotateCcw,
  FileText,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Save,
  X,
  ZoomIn,
  ZoomOut,
  Plus,
  Trash2,
  Settings,
  Mail,
  Key,
  Database,
  Bell,
  Users,
  Upload,
  ExternalLink,
  Play,
} from 'lucide-react';

const InvoiceDashboard = () => {
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
        {
          id: 'INV-2025-0893',
          vendor: 'Acme Corp',
          amount: 12450.0,
          confidence: 98,
          status: 'approved',
        },
        {
          id: 'INV-2025-0894',
          vendor: 'Beta Systems',
          amount: 8720.0,
          confidence: 62,
          status: 'review',
        },
        {
          id: 'INV-2025-0895',
          vendor: 'Gamma Ltd',
          amount: 19300.0,
          confidence: 54,
          status: 'review',
        },
        {
          id: 'INV-2025-0896',
          vendor: 'Delta Inc',
          amount: 5600.0,
          confidence: 95,
          status: 'approved',
        },
        {
          id: 'INV-2025-0897',
          vendor: 'Epsilon Co',
          amount: 11200.0,
          confidence: 99,
          status: 'approved',
        },
        {
          id: 'INV-2025-0898',
          vendor: 'Zeta Group',
          amount: 7800.0,
          confidence: 97,
          status: 'approved',
        },
        {
          id: 'INV-2025-0899',
          vendor: 'Eta Partners',
          amount: 15300.0,
          confidence: 96,
          status: 'approved',
        },
        {
          id: 'INV-2025-0900',
          vendor: 'Theta LLC',
          amount: 9500.0,
          confidence: 98,
          status: 'approved',
        },
        {
          id: 'INV-2025-0901',
          vendor: 'Iota Systems',
          amount: 6700.0,
          confidence: 94,
          status: 'approved',
        },
        {
          id: 'INV-2025-0902',
          vendor: 'Kappa Corp',
          amount: 13400.0,
          confidence: 99,
          status: 'approved',
        },
        {
          id: 'INV-2025-0903',
          vendor: 'Lambda Inc',
          amount: 8900.0,
          confidence: 97,
          status: 'approved',
        },
        {
          id: 'INV-2025-0904',
          vendor: 'Mu Technologies',
          amount: 10600.0,
          confidence: 95,
          status: 'approved',
        },
        {
          id: 'INV-2025-0905',
          vendor: 'Nu Enterprises',
          amount: 12100.0,
          confidence: 98,
          status: 'approved',
        },
        {
          id: 'INV-2025-0906',
          vendor: 'Xi Solutions',
          amount: 7200.0,
          confidence: 96,
          status: 'approved',
        },
        {
          id: 'INV-2025-0907',
          vendor: 'Omicron Ltd',
          amount: 9800.0,
          confidence: 99,
          status: 'approved',
        },
        {
          id: 'INV-2025-0908',
          vendor: 'Pi Industries',
          amount: 11500.0,
          confidence: 97,
          status: 'approved',
        },
        {
          id: 'INV-2025-0909',
          vendor: 'Rho Group',
          amount: 8300.0,
          confidence: 95,
          status: 'approved',
        },
        {
          id: 'INV-2025-0910',
          vendor: 'Sigma Corp',
          amount: 14200.0,
          confidence: 98,
          status: 'approved',
        },
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
        {
          id: 'INV-2025-0920',
          vendor: 'Alpha Corp',
          amount: 15000.0,
          confidence: 99,
          status: 'approved',
        },
        {
          id: 'INV-2025-0921',
          vendor: 'Beta Industries',
          amount: 8500.0,
          confidence: 97,
          status: 'approved',
        },
        {
          id: 'INV-2025-0922',
          vendor: 'Gamma Solutions',
          amount: 12300.0,
          confidence: 96,
          status: 'approved',
        },
        {
          id: 'INV-2025-0923',
          vendor: 'Delta Tech',
          amount: 9800.0,
          confidence: 98,
          status: 'approved',
        },
        {
          id: 'INV-2025-0924',
          vendor: 'Epsilon Group',
          amount: 11200.0,
          confidence: 95,
          status: 'approved',
        },
        {
          id: 'INV-2025-0925',
          vendor: 'Zeta Systems',
          amount: 13500.0,
          confidence: 99,
          status: 'approved',
        },
        {
          id: 'INV-2025-0926',
          vendor: 'Eta Enterprises',
          amount: 7600.0,
          confidence: 97,
          status: 'approved',
        },
        {
          id: 'INV-2025-0927',
          vendor: 'Theta Corp',
          amount: 10900.0,
          confidence: 98,
          status: 'approved',
        },
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

  const stats = useMemo(
    () => ({
      batches: 12,
      documents: 428,
      successRate: 92,
      needsReview: 3,
    }),
    []
  );

  const filteredBatches = useMemo(
    () =>
      batches.filter((b) =>
        b.id.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [searchTerm]
  );

  const filteredDocuments = useMemo(() => {
    if (!selectedBatch) return [];
    const docs = selectedBatch.documents;
    if (activeTab === 'all') return docs;
    if (activeTab === 'approved')
      return docs.filter((d) => d.status === 'approved');
    if (activeTab === 'review')
      return docs.filter((d) => d.status === 'review');
    return docs;
  }, [selectedBatch, activeTab]);

  const toggleBatch = (id) => {
    const newSelected = new Set(selectedBatches);
    newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
    setSelectedBatches(newSelected);
  };

  const toggleAll = () => {
    setSelectedBatches(
      selectedBatches.size === batches.length
        ? new Set()
        : new Set(batches.map((b) => b.id))
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
      Success: <CheckCircle className="w-4 h-4" />,
      Partial: <Clock className="w-4 h-4" />,
      Warning: <AlertTriangle className="w-4 h-4" />,
    };
    return icons[status];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                FABBYY FLEXICAPTURE
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Hi, <span className="font-medium text-gray-900">Faisal Suleman</span>
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
              FS
            </div>
          </div>
        </div>
      </header>

      {selectedDocument ? (
        <VerificationScreen
          document={selectedDocument}
          batch={selectedBatch}
          onBack={() => setSelectedDocument(null)}
          onSave={() => {
            setSelectedDocument(null);
            // In real app, this would update the document status
          }}
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
            <h2 className="text-2xl font-bold text-gray-900">
              Batch {batch.id}
            </h2>
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
            <div className="text-xs font-medium text-gray-500 uppercase">
              Received
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {batch.receivedFull}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-gray-400" />
            <div className="text-xs font-medium text-gray-500 uppercase">
              Processed
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {batch.processed}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <div className="text-xs font-medium text-gray-500 uppercase">
              Total Docs
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {batch.docs}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <div className="text-xs font-medium text-gray-500 uppercase">
              Status
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-emerald-600">
              {batch.approved}
            </span>
            <span className="text-sm text-gray-400">Approved</span>
            <span className="text-lg font-semibold text-amber-600">
              {batch.review}
            </span>
            <span className="text-sm text-gray-400">Review</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              All ({batch.docs})
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'approved'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Auto-Approved ({batch.approved})
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'review'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Needs Review ({batch.review})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'history'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'export'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              Export
            </button>
          </div>
        </div>

        {/* Document Grid */}
        {activeTab === 'export' ? (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Export History & Options
              </h3>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Last Export
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {exportDestinations.map((dest) => (
                      <tr key={dest.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {dest.type === 'CSV' && (
                              <FileText className="w-4 h-4 text-gray-400" />
                            )}
                            {dest.type === 'SQL' && (
                              <Database className="w-4 h-4 text-gray-400" />
                            )}
                            {dest.type === 'PowerApps' && (
                              <ExternalLink className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {dest.name}
                            </span>
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
                            {dest.status === 'Success' ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <AlertTriangle className="w-3 h-3" />
                            )}
                            {dest.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {dest.lastExport}
                        </td>
                        <td className="px-6 py-4">
                          {dest.status === 'Success' ? (
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                              View
                            </button>
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
          </div>
        ) : activeTab !== 'history' ? (
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              {filteredDocuments.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onClick={() => onDocumentClick(doc)}
                />
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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {document.id}
        </h3>
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
            <p className={`text-lg font-semibold ${confidenceColor}`}>
              {document.confidence}%
            </p>
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
      emailAccounts.map((acc) =>
        acc.id === id ? { ...acc, [field]: value } : acc
      )
    );
  };

  const handleTestConnection = (id) => {
    setTestingConnection(true);
    setTimeout(() => {
      setEmailAccounts(
        emailAccounts.map((acc) =>
          acc.id === id
            ? { ...acc, lastTest: 'Success', status: 'Active' }
            : acc
        )
      );
      setTestingConnection(false);
    }, 1500);
  };

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
      exportDestinations.map((dest) =>
        dest.id === id ? { ...dest, [field]: value } : dest
      )
    );
  };

  const handleTestExport = (id) => {
    setTestingExport(true);
    setTimeout(() => {
      setExportDestinations(
        exportDestinations.map((dest) =>
          dest.id === id
            ? { ...dest, lastTest: 'Success', status: 'Active' }
            : dest
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

      {/* Settings Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveSettingsTab('email')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeSettingsTab === 'email'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email Accounts
            </button>
            <button
              onClick={() => setActiveSettingsTab('api')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeSettingsTab === 'api'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Key className="w-4 h-4" />
              API Keys
            </button>
            <button
              onClick={() => setActiveSettingsTab('storage')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeSettingsTab === 'storage'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Database className="w-4 h-4" />
              Storage
            </button>
            <button
              onClick={() => setActiveSettingsTab('notifications')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeSettingsTab === 'notifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Bell className="w-4 h-4" />
              Notifications
            </button>
            <button
              onClick={() => setActiveSettingsTab('users')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeSettingsTab === 'users'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Users
            </button>
            <button
              onClick={() => setActiveSettingsTab('exports')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeSettingsTab === 'exports'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Upload className="w-4 h-4" />
              Export Destinations
            </button>
          </div>
        </div>
      </div>

      {/* Email Accounts Tab */}
      {activeSettingsTab === 'email' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Email Accounts
            </h3>
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
              onUpdate={(field, value) =>
                handleUpdateAccount(account.id, field, value)
              }
              onTest={() => handleTestConnection(account.id)}
              testingConnection={testingConnection}
            />
          ))}
        </div>
      )}

      {/* Placeholder for other tabs */}
      {activeSettingsTab === 'exports' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Export Destinations
            </h3>
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
              onUpdate={(field, value) =>
                handleUpdateExportDestination(destination.id, field, value)
              }
              onTest={() => handleTestExport(destination.id)}
              testingExport={testingExport}
            />
          ))}
        </div>
      )}

      {activeSettingsTab !== 'email' && activeSettingsTab !== 'exports' && (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {activeSettingsTab === 'api' && (
              <Key className="w-8 h-8 text-gray-400" />
            )}
            {activeSettingsTab === 'storage' && (
              <Database className="w-8 h-8 text-gray-400" />
            )}
            {activeSettingsTab === 'notifications' && (
              <Bell className="w-8 h-8 text-gray-400" />
            )}
            {activeSettingsTab === 'users' && (
              <Users className="w-8 h-8 text-gray-400" />
            )}
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
              <h4 className="text-lg font-semibold text-gray-900">
                {destination.name}
              </h4>
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

      <div className="space-y-4 mb-6">
        {/* Type Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Type
          </label>
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

        {/* SQL Server specific fields */}
        {destination.type === 'SQL Server' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={destination.name}
                  onChange={(e) => onUpdate('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <p className="text-gray-900">{destination.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Connection String
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={destination.connectionString}
                  onChange={(e) => onUpdate('connectionString', e.target.value)}
                  placeholder="Server=myServerAddress;Database=myDataBase;User Id=myUsername;Password=myPassword;"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              ) : (
                <p className="text-gray-900 font-mono text-sm">
                  {destination.connectionString}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Target Table
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                On Success
              </label>
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

        {/* Power Automate specific fields */}
        {destination.type === 'Power Automate' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Webhook URL
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={destination.webhookUrl}
                  onChange={(e) => onUpdate('webhookUrl', e.target.value)}
                  placeholder="https://prod-123.logic.azure.com/workflows/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              ) : (
                <p className="text-gray-900 font-mono text-sm break-all">
                  {destination.webhookUrl}
                </p>
              )}
            </div>

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
              <h4 className="text-lg font-semibold text-gray-900">
                {account.accountName}
              </h4>
            )}
            <p className="text-sm text-gray-500">
              {account.protocol} - {account.host}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
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
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Protocol
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Poll Every
              </label>
              {isEditing ? (
                <select
                  value={account.pollInterval}
                  onChange={(e) =>
                    onUpdate('pollInterval', parseInt(e.target.value))
                  }
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Host
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Port
              </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Username
            </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Folder
            </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Subject Contains (filters)
            </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Download Folder
            </label>
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

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={account.archiveAfter}
                onChange={(e) => onUpdate('archiveAfter', e.target.checked)}
                disabled={!isEditing}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Archive After Processing
              </span>
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

const VerificationScreen = ({ document, batch, onBack, onSave }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: document.id,
    vendor: document.vendor,
    amount: document.amount,
    invoiceDate: '2025-11-15',
    dueDate: '2025-12-15',
    poNumber: 'PO-2025-1234',
    description: 'Professional services for Q4 2025',
    taxAmount: (document.amount * 0.1).toFixed(2),
    subtotal: (document.amount * 0.9).toFixed(2),
    lineItems: [
      {
        id: 1,
        description: 'Professional services for Q4 2025',
        quantity: 1,
        unitPrice: (document.amount * 0.9).toFixed(2),
        total: (document.amount * 0.9).toFixed(2),
      },
    ],
  });

  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addLineItem = () => {
    const newItem = {
      id: formData.lineItems.length + 1,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    setFormData((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, newItem],
    }));
  };

  const updateLineItem = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.total = (
              parseFloat(updated.quantity) * parseFloat(updated.unitPrice)
            ).toFixed(2);
          }
          return updated;
        }
        return item;
      }),
    }));
  };

  const removeLineItem = (id) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((item) => item.id !== id),
    }));
  };

  const handleApprove = () => {
    // In real app, this would update the document status to approved
    onSave();
  };

  const handleReject = () => {
    // In real app, this would mark document as rejected
    onBack();
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Batch</span>
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {document.id}
              </h2>
              <p className="text-sm text-gray-500">Batch: {batch.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                document.confidence >= 90
                  ? 'bg-emerald-50 text-emerald-700'
                  : document.confidence >= 70
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              Confidence: {document.confidence}%
            </div>
            <button
              onClick={handleReject}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-medium"
            >
              <CheckCircle className="w-4 h-4" />
              Approve & Save
            </button>
          </div>
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: PDF Viewer (60%) */}
        <div className="w-[60%] bg-gray-900 flex flex-col">
          {/* PDF Controls */}
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="p-2 hover:bg-gray-700 rounded text-white"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white text-sm font-medium w-16 text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="p-2 hover:bg-gray-700 rounded text-white"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-6 bg-gray-600 mx-2"></div>
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-2 hover:bg-gray-700 rounded text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="text-white text-sm">Page 1 of 1</div>
          </div>

          {/* PDF Display Area */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div
              className="bg-white shadow-2xl transition-transform"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
              }}
            >
              <div className="w-[600px] h-[800px] p-12 flex flex-col">
                {/* Mock Invoice */}
                <div className="border-b-2 border-gray-800 pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    Invoice #{document.id}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
                    <p className="text-gray-700 font-medium">
                      {document.vendor}
                    </p>
                    <p className="text-sm text-gray-600">123 Business St</p>
                    <p className="text-sm text-gray-600">New York, NY 10001</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">To:</h3>
                    <p className="text-gray-700 font-medium">Acme Corp</p>
                    <p className="text-sm text-gray-600">456 Client Ave</p>
                    <p className="text-sm text-gray-600">
                      Los Angeles, CA 90001
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                  <div>
                    <span className="text-gray-600">Invoice Date:</span>
                    <span className="ml-2 font-medium">Nov 15, 2025</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <span className="ml-2 font-medium">Dec 15, 2025</span>
                  </div>
                  <div>
                    <span className="text-gray-600">PO Number:</span>
                    <span className="ml-2 font-medium">PO-2025-1234</span>
                  </div>
                </div>

                <div className="border-t border-b border-gray-300 py-4 mb-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="text-left py-2 font-semibold">
                          Description
                        </th>
                        <th className="text-right py-2 font-semibold">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">
                          Professional services for Q4 2025
                        </td>
                        <td className="text-right">
                          ${(document.amount * 0.9).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="ml-auto w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      ${(document.amount * 0.9).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-medium">
                      ${(document.amount * 0.1).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-800 pt-2">
                    <span>Total:</span>
                    <span>${document.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Form (40%) */}
        <div className="w-[40%] bg-white overflow-y-auto">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Invoice Details
            </h3>

            <div className="space-y-5">
              {/* Invoice Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invoice Number *
                </label>
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) =>
                    handleChange('invoiceNumber', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Vendor Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  value={formData.vendor}
                  onChange={(e) => handleChange('vendor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Invoice Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  value={formData.invoiceDate}
                  onChange={(e) => handleChange('invoiceDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => handleChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* PO Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  PO Number
                </label>
                <input
                  type="text"
                  value={formData.poNumber}
                  onChange={(e) => handleChange('poNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Line Items */}
              <div className="border-t border-gray-200 pt-5">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-900">
                    Line Items
                  </label>
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.lineItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Item {index + 1}
                        </span>
                        {formData.lineItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLineItem(item.id)}
                            className="text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) =>
                              updateLineItem(
                                item.id,
                                'description',
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Item description"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              step="1"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                updateLineItem(
                                  item.id,
                                  'quantity',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Unit Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) =>
                                updateLineItem(
                                  item.id,
                                  'unitPrice',
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Total
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={item.total}
                              readOnly
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-700 font-medium"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amounts */}
              <div className="border-t border-gray-200 pt-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subtotal *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.subtotal}
                      onChange={(e) => handleChange('subtotal', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Tax Amount *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.taxAmount}
                      onChange={(e) =>
                        handleChange('taxAmount', e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Total Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      handleChange('amount', parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-semibold text-lg"
                  />
                </div>
              </div>

              {/* AI Suggestions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">AI</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">
                      AI Extraction Confidence
                    </h4>
                    <p className="text-sm text-blue-700">
                      {document.confidence >= 90
                        ? 'High confidence - All fields extracted successfully'
                        : 'Medium confidence - Please verify highlighted fields'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.batches}
          </div>
          <div className="text-sm text-gray-600">Batches Today</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.documents}
          </div>
          <div className="text-sm text-gray-600">Documents Processed</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="text-3xl font-bold text-emerald-600 mb-1">
            {stats.successRate}%
          </div>
          <div className="text-sm text-gray-600">
            Auto-Approved Success Rate
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-5 relative">
          {stats.needsReview > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {stats.needsReview}
            </div>
          )}
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.needsReview}
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Batch ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Received
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Docs
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Approved
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBatches.map((batch) => (
                <tr
                  key={batch.id}
                  className="hover:bg-gray-50 transition-colors"
                >
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
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {batch.received}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-center font-medium">
                    {batch.docs}
                  </td>
                  <td className="px-6 py-4 text-sm text-emerald-600 text-center font-medium">
                    {batch.approved}
                  </td>
                  <td className="px-6 py-4 text-sm text-center">
                    <span
                      className={`font-medium ${
                        batch.review > 0 ? 'text-amber-600' : 'text-gray-400'
                      }`}
                    >
                      {batch.review}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(
                        batch.status
                      )}`}
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
            Page{' '}
            <span className="font-medium text-gray-900">{currentPage}</span> of{' '}
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
            <span className="font-medium text-gray-900">
              {selectedBatches.size}
            </span>{' '}
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

export default InvoiceDashboard;
