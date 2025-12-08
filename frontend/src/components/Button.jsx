import React from 'react';


export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
const base = 'px-4 py-2 rounded-lg font-semibold shadow-sm transition-transform active:scale-95';
const variants = {
primary: `bg-gold text-maroon hover:bg-opacity-90`,
secondary: `bg-gray-200 text-gray-800 hover:bg-gray-100`,
danger: `bg-red-600 text-white hover:bg-red-700`,
warn: `bg-yellow-500 text-maroon hover:bg-yellow-600`,
};
return (
<button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
{children}
</button>
);
};


// ----------------------------- File: src/components/Card.jsx -----------------------------
import React from 'react';


export const Card = ({ children, className = '' }) => (
<div className={`bg-white/5 backdrop-blur-sm p-5 rounded-2xl shadow-lg ${className}`}>
{children}
</div>
);
