import React, { useState, useEffect } from 'react';
import { FaTimes, FaHistory, FaCalendarAlt, FaUser, FaIdBadge } from 'react-icons/fa';
import PositionNumberService from '../../services/positionNumberService';
import PositionNumberBadge from '../common/PositionNumberBadge';

const PositionNumberHistoryModal = ({ user, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await PositionNumberService.getUserPositionHistory(user.id);
        setHistory(response.data || []);
      } catch (error) {
        console.error('Error fetching position history:', error);
        setError('ไม่สามารถดึงข้อมูลประวัติได้');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FaHistory className="text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                ประวัติเลขที่ตำแหน่ง
              </h2>
              <p className="text-sm text-gray-600">
                {user.prefixName} {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">กำลังโหลดข้อมูล...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-500 mb-2">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="text-blue-600 hover:underline text-sm"
              >
                ลองใหม่
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <FaHistory className="text-gray-300 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">ไม่มีประวัติการเปลี่ยนเลขที่ตำแหน่ง</p>
              <p className="text-sm text-gray-400 mt-1">
                ผู้ใช้นี้ยังไม่เคยได้รับการกำหนดเลขที่ตำแหน่ง
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Timeline */}
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                {history.map((record, index) => (
                  <div key={record.id} className="relative flex items-start gap-4 pb-6">
                    {/* Timeline dot */}
                    <div className={`
                      relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                      ${record.isCurrent
                        ? 'bg-green-100 border-2 border-green-500'
                        : 'bg-gray-100 border-2 border-gray-300'
                      }
                    `}>
                      {record.isCurrent ? (
                        <FaIdBadge className="text-green-600 text-sm" />
                      ) : (
                        <FaHistory className="text-gray-500 text-sm" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <PositionNumberBadge
                              positionNumber={record.positionNumber}
                              size="lg"
                              showTooltip={false}
                            />
                            {record.isCurrent && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                ปัจจุบัน
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">มีผลบังคับ:</span>
                              <div className="flex items-center gap-1 text-gray-900 font-medium">
                                <FaCalendarAlt className="text-gray-400" />
                                {formatDate(record.effectiveFrom)}
                              </div>
                            </div>

                            {record.effectiveTo && (
                              <div>
                                <span className="text-gray-500">สิ้นสุด:</span>
                                <div className="flex items-center gap-1 text-gray-900 font-medium">
                                  <FaCalendarAlt className="text-gray-400" />
                                  {formatDate(record.effectiveTo)}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Additional info */}
                          <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                            <div className="flex items-center justify-between">
                              <span>
                                บันทึกเมื่อ: {formatDateTime(record.createdAt)}
                              </span>
                              {record.updatedAt && (
                                <span>
                                  อัปเดตเมื่อ: {formatDateTime(record.updatedAt)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 mb-2">สรุปประวัติ</h3>
                <div className="text-sm text-blue-800">
                  <p>• จำนวนครั้งที่เปลี่ยนเลขที่ตำแหน่ง: {history.length - 1} ครั้ง</p>
                  <p>• เลขที่ตำแหน่งปัจจุบัน: {history[0]?.positionNumber || 'ไม่มี'}</p>
                  <p>• วันที่ได้รับเลขปัจจุบัน: {history[0]?.effectiveFrom ? formatDate(history[0].effectiveFrom) : '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PositionNumberHistoryModal;
