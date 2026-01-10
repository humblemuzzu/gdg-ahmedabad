"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

// This page now redirects to the dedicated report page
export default function HistoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  useEffect(() => {
    // Redirect to the dedicated report page
    router.replace(`/report/${caseId}`);
  }, [caseId, router]);

  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex items-center gap-3 text-muted-foreground">
        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Redirecting to report...
      </div>
    </div>
  );
}
