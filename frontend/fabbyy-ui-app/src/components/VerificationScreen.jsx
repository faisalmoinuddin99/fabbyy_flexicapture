
import React, { useState } from 'react';
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, X, CheckCircle, Plus } from 'lucide-react';

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
    onSave();
  };

  const handleReject = () => {
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
              <h2 className="text-lg font-semibold text-gray-900">{document.id}</h2>
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

      {/* Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: PDF Viewer */}
        <div className="w-[60%] bg-gray-900 flex flex-col">
          <div className="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="p-2 hover:bg-gray-700 rounded text-white"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white text-sm font-medium w-16 text-center">{zoom}%</span>
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

          {/* PDF Display */}
          <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            <div
              className="bg-white shadow-2xl transition-transform"
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: 'center',
              }}
            >
              {/* Mock Invoice */}
              <div className="w-[600px] h-[800px] p-12 flex flex-col">
                <div className="border-b-2 border-gray-800 pb-4 mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">INVOICE</h1>
                  <p className="text-sm text-gray-600 mt-1">Invoice #{document.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">From:</h3>
                    <p className="text-gray-700 font-medium">{document.vendor}</p>
                    <p className="text-sm text-gray-600">123 Business St</p>
                    <p className="text-sm text-gray-600">New York, NY 10001</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">To:</h3>
                    <p className="text-gray-700 font-medium">Acme Corp</p>
                    <p className="text-sm text-gray-600">456 Client Ave</p>
                    <p className="text-sm text-gray-600">Los Angeles, CA 90001</p>
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
                        <th className="text-left py-2 font-semibold">Description</th>
                        <th className="text-right py-2 font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">Professional services for Q4 2025</td>
                        <td className="text-right">${(document.amount * 0.9).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="ml-auto w-64 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${(document.amount * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%):</span>
                    <span className="font-medium">${(document.amount * 0.1).toFixed(2)}</span>
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

        {/* Right: Form */}
        <div className="w-[40%] bg-white overflow-y-auto p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Invoice Details</h3>
          {/* Form Fields */}
          {/* (Keep same logic as original for inputs, line items, etc.) */}
          {/* For brevity, you can copy the form block from original code */}
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
  );
};

export default VerificationScreen;
