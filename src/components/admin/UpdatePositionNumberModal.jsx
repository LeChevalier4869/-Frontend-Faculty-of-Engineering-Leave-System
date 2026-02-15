import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaExclamationTriangle } from 'react-icons/fa';
import Swal from 'sweetalert2';
import PositionNumberService from '../../services/positionNumberService';
import PositionNumberBadge from '../common/PositionNumberBadge';

const UpdatePositionNumberModal = ({ user, onClose, onSuccess }) => {
  const [positionNumber, setPositionNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);

  // Fetch current position number
  useEffect(() => {
    const fetchCurrentPosition = async () => {
      try {
        // Debug: ตรวจสอบ user data
        console.log('User data:', user);

        const response = await PositionNumberService.getCurrentPositionNumber(user.id);
        setCurrentPosition(response.data);
      } catch (error) {
        console.error('Error fetching current position:', error);
      }
    };

    fetchCurrentPosition();
  }, [user.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!positionNumber.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'กรุณาระบุเลขที่ตำแหน่ง',
        text: 'เลขที่ตำแหน่งเป็นข้อมูลที่จำเป็นต้องระบุ',
        confirmButtonColor: '#3B82F6'
      });
      return;
    }

    // ยืนยันการเปลี่ยนแปลงด้วย SweetAlert2
    const result = await Swal.fire({
      title: 'ยืนยันการเปลี่ยนเลขที่ตำแหน่ง',
      html: `
        <p>คุณแน่ใจหรือไม่ที่จะเปลี่ยนเลขที่ตำแหน่งเป็น:</p>
        <div class="text-xl font-bold text-blue-600 my-3">${positionNumber.trim()}</div>
        <p class="text-sm text-gray-600">สำหรับ: ${user?.fullName || 'ผู้ใช้'}</p>
        <div class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          ⚠️ การเปลี่ยนแปลงนี้จะบันทึกประวัติและไม่สามารถย้อนกลับได้
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการเปลี่ยนแปลง',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      reverseButtons: true
    });

    if (!result.isConfirmed) return;

    setLoading(true);
    setError('');

    try {
      await PositionNumberService.updateUserPositionNumber(user.id, positionNumber.trim());

      await Swal.fire({
        icon: 'success',
        title: 'อัปเดตสำเร็จ!',
        text: `เปลี่ยนเลขที่ตำแหน่งเป็น "${positionNumber.trim()}" เรียบร้อยแล้ว`,
        confirmButtonColor: '#10B981'
      });

      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัปเดตเลขที่ตำแหน่ง';

      await Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: errorMessage,
        confirmButtonColor: '#EF4444'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            เปลี่ยนเลขที่ตำแหน่ง
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 font-semibold">
                {user?.fullName?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-4">
                ผู้ใช้: {user?.fullName || 'ไม่ทราบชื่อ'}
              </div>
              <div className="text-sm text-gray-600 mb-4">
                อีเมล: {user?.email || 'ไม่มีข้อมูล'}
              </div>
              <p className="text-sm text-gray-500">{user.department?.name}</p>
            </div>
          </div>

          {currentPosition && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">เลขที่ตำแหน่งปัจจุบัน:</span>
                <PositionNumberBadge
                  positionNumber={currentPosition.positionNumber}
                  effectiveFrom={currentPosition.effectiveFrom}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ได้รับเมื่อ: {formatDate(currentPosition.effectiveFrom)}
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              เลขที่ตำแหน่งใหม่ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={positionNumber}
              onChange={(e) => setPositionNumber(e.target.value)}
              placeholder="เช่น ENG-001, ADM-002"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              รูปแบบที่แนะนำ: ตัวอักษรย่อ-ตัวเลข (เช่น ENG-001)
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  กำลังบันทึก...
                </>
              ) : (
                <>
                  <FaSave />
                  บันทึก
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePositionNumberModal;
