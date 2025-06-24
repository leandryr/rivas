// src/app/login/reset-password/page.tsx
'use client';

import { Suspense } from 'react';
import ResetPasswordContent from './ResetPasswordContent';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando reset...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
