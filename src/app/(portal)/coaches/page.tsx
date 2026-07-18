import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function CoachesPage() {
  return (
    <ComingSoon
      moduleName="Coach Management"
      description="Certified trainer roster logs and client active counts."
      futureEndpoints={["GET /api/v1/coaches", "POST /api/v1/coaches", "DELETE /api/v1/coaches/{id}"]}
      isPortal={true}
    />
  );
}
