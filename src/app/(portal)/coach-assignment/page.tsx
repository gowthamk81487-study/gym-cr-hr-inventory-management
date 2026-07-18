import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function CoachAssignmentPage() {
  return (
    <ComingSoon
      moduleName="Coach Assignment"
      description="Interactive dashboard for coach allocation."
      futureEndpoints={["GET /api/v1/assignments", "POST /api/v1/assignments/allocate"]}
      isPortal={true}
    />
  );
}
