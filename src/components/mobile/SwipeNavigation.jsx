import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";

const PAGE_ORDER = ['Home', 'Checklist', 'Dashboard', 'TradeHistory', 'Account'];

export default function SwipeNavigation({ currentPage, children }) {
  const navigate = useNavigate();

  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 100;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) < swipeThreshold) return;

      const currentIndex = PAGE_ORDER.indexOf(currentPage);
      if (currentIndex === -1) return;

      if (diff > 0 && currentIndex < PAGE_ORDER.length - 1) {
        // Swipe left - next page
        navigate(createPageUrl(PAGE_ORDER[currentIndex + 1]));
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right - previous page
        navigate(createPageUrl(PAGE_ORDER[currentIndex - 1]));
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPage, navigate]);

  return <>{children}</>;
}