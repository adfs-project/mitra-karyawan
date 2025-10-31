// This component is obsolete and has been replaced by the centralized routing logic in App.tsx and routing/routeConfig.ts.
// It is kept to prevent import errors but should not be used.
import React from 'react';

const ObsoleteAutoLayoutRoute: React.FC<{children?: React.ReactNode}> = ({ children }) => {
  return <>{children}</>;
};

export default ObsoleteAutoLayoutRoute;
