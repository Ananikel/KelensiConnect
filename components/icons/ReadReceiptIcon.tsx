import React from 'react';

interface ReadReceiptIconProps {
  status: 'sent' | 'delivered' | 'read';
}

const ReadReceiptIcon: React.FC<ReadReceiptIconProps> = ({ status }) => {
  const commonClasses = "h-4 w-4";
  
  if (status === 'sent') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} text-gray-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  
  const iconColor = status === 'read' ? 'text-blue-500' : 'text-gray-400';
  
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={`${commonClasses} ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13l4 4L23 7" opacity="0.8" transform="translate(-4,0)"/>
    </svg>
  );
};

export default ReadReceiptIcon;
