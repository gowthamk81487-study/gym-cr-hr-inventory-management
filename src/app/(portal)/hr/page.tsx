import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function HrPage() {
  return (
    <ComingSoon
      moduleName="HR Management"
      description="HR administration directory and employee payroll logs."
      futureEndpoints={["GET /api/v1/hr/staff", "POST /api/v1/hr/staff", "DELETE /api/v1/hr/staff/{id}"]}
      isPortal={true}
    />
  );
}
