import React from 'react';

const PositionNumberBadge = ({ positionNumber, effectiveFrom, size = 'md', showTooltip = true }) => {
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const tooltipContent = effectiveFrom
    ? `เลขที่ตำแหน่ง: ${positionNumber}\nได้รับเมื่อ: ${formatDate(effectiveFrom)}`
    : `เลขที่ตำแหน่ง: ${positionNumber}`;

  return (
    <span
      className={`
        text-gray-700
        ${sizeClasses[size]}
      `}
      title={showTooltip ? tooltipContent : ''}
    >
      {positionNumber || '-'}
    </span>
  );
};

export default PositionNumberBadge;
