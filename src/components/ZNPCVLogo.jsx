import React from 'react';

export default function ZNPCVLogo({ className = "", size = "default" }) {
  const sizeClasses = {
    small: "text-xl",
    default: "text-3xl",
    large: "text-5xl"
  };

  return (
    <div className={`font-black tracking-[0.3em] ${sizeClasses[size]} ${className}`}>
      ZNPCV
    </div>
  );
}