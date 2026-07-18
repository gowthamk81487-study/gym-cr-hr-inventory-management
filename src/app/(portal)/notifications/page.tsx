import React from 'react';
import ComingSoon from '@/components/common/ComingSoon';

export default function NotificationsPage() {
  return (
    <ComingSoon
      moduleName="Alert Feed"
      description="Alert feeds, unread notices, and logging notifications."
      futureEndpoints={["GET /api/v1/notifications", "PUT /api/v1/notifications/read-all"]}
      isPortal={true}
    />
  );
}
