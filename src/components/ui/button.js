import React from 'react';
import Link from 'next/link';

export const Button = ({ 
  children, 
  href, 
  variant = 'primary', 
  className = '', 
  onClick, 
  type = 'button',
  disabled = false,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 focus:ring-indigo-500 px-6 py-3",
    secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 focus:ring-slate-500 px-6 py-3",
    outlined: "bg-transparent border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10 focus:ring-indigo-500 px-6 py-3",
    accent: "bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 focus:ring-cyan-500 px-6 py-3",
    ghost: "bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white px-4 py-2",
    icon: "bg-slate-800/50 p-2 text-slate-300 hover:bg-slate-700 hover:text-white rounded-full",
  };
  
  const variantStyles = variants[variant] || variants.primary;
  const buttonStyles = `${baseStyles} ${variantStyles} ${className}`;
  
  // If href is provided, render as Link
  if (href) {
    return (
      <Link href={href} className={buttonStyles} {...props}>
        {children}
      </Link>
    );
  }
  
  // Otherwise render as button
  return (
    <button
      type={type}
      className={buttonStyles}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}; 