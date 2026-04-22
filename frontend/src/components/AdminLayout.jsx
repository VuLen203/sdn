import React from 'react';

function AdminLayout({ children }) {
  return (
    <div className="animate-fade" style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: '0 1.5rem 4rem' 
    }}>
      {children}
    </div>
  );
}

export default AdminLayout;
