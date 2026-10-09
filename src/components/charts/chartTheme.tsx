import React from 'react';

export const SOFT_UI_COLORS = {
  bgCanvas: '#F5F6FA', // Light off-white background
  cardBg: '#FFFFFF',
  cardShadow: 'shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.07)]',
  
  // Vibrant soft palette
  pink: '#F4638C',
  amber: '#F5A623',
  teal: '#2DD4BF',
  blue: '#4A90D9',
  purple: '#9B6EF3',
  emerald: '#10B981',

  // Gradients definition helpers
  gradients: {
    pinkOrange: { id: 'gradPinkOrange', from: '#F4638C', to: '#F5A623' },
    tealBlue: { id: 'gradTealBlue', from: '#2DD4BF', to: '#4A90D9' },
    purplePink: { id: 'gradPurplePink', from: '#9B6EF3', to: '#F4638C' },
    amberRose: { id: 'gradAmberRose', from: '#F5A623', to: '#F4638C' },
    blueTeal: { id: 'gradBlueTeal', from: '#4A90D9', to: '#2DD4BF' },
    emeraldTeal: { id: 'gradEmeraldTeal', from: '#10B981', to: '#2DD4BF' },
  },
};

export const DecorativeDots: React.FC = () => (
  <div className="flex items-center gap-1.5 shrink-0">
    <span className="w-2.5 h-2.5 rounded-full bg-[#F4638C]" />
    <span className="w-2.5 h-2.5 rounded-full bg-[#F5A623]" />
    <span className="w-2.5 h-2.5 rounded-full bg-[#2DD4BF]" />
  </div>
);
