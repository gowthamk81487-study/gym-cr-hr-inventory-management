import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function SettingsPage() {
  return (
    <ComingSoon
      moduleName="System Settings"
      description="Branch allocations, RBAC clearance profiles, and SaaS toggle gates."
      futureEndpoints={["GET /api/v1/settings/config", "PUT /api/v1/settings/config"]}
      isPortal={true}
    />
  );
}
