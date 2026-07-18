import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function MembershipsPage() {
  return (
    <ComingSoon
      moduleName="Membership Management"
      description="Gym membership tier definitions, rates, and benefits settings."
      futureEndpoints={["GET /api/v1/memberships", "POST /api/v1/memberships", "PUT /api/v1/memberships/{id}"]}
      isPortal={true}
    />
  );
}
