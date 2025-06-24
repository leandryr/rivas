// src/app/login/page.tsx
'use client';

import { Suspense } from 'react';
import LoginContent from './LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
