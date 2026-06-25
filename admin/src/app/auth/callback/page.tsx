import { Suspense } from 'react';
import AuthCallbackClient from '@/app/auth/callback/AuthCallbackClient';

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<p className="p-8 font-mono">Yükleniyor...</p>}>
      <AuthCallbackClient />
    </Suspense>
  );
}
