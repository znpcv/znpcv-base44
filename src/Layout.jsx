import React from 'react';

export default function Layout({ children }) {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
          
          * {
            font-family: 'Bebas Neue', sans-serif;
          }
          
          input, textarea, select, button {
            font-family: 'Bebas Neue', sans-serif;
          }
        `}
      </style>
      <div className="min-h-screen bg-black">
        {children}
      </div>
    </>
  );
}