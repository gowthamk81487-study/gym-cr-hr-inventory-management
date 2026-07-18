import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function ReportsPage() {
  return (
    <ComingSoon
      moduleName="Analytics Reports"
      description="Financial line charts and attendance percentage reports summaries."
      futureEndpoints={["GET /api/v1/reports/financial", "GET /api/v1/reports/attendance"]}
      isPortal={true}
    />
  );
}
