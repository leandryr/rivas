'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, MailIcon } from 'lucide-react';

interface Props {
  email: string;
  onVerified: () => void;
}

interface UserResponse {
  user?: {
    isEmailVerified?: boolean;
  };
}

export default function EmailVerification({ email, onVerified }: Props) {
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailStatusLoading, setEmailStatusLoading] = useState(true);

  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/users/me');
        const json: UserResponse = await res.json();
        setEmailVerified(!!json.user?.isEmailVerified);
      } catch {
        setEmailVerified(false);
      } finally {
        setEmailStatusLoading(false);
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    if (codeSent && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) clearInterval(interval);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [codeSent, timer]);

  const handleSendCode = async () => {
    if (timer > 0) return;

    try {
      setMessage(null);
      const res = await fetch('/api/email/send-code', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to send code');

      setCodeSent(true);
      setTimer(59);
      setMessage(' Verification code sent to your email.');
    } catch {
      setMessage('❌ Error sending email. Try again.');
    }
  };

  const handleConfirmCode = async () => {
    if (!code.trim()) {
      setMessage('⚠️ Please enter the code.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/email/confirm-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'Verification failed');

      setEmailVerified(true);
      setMessage('Email successfully verified.');
      onVerified();
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border p-3 rounded-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
            <MailIcon className="w-4 h-4" />
            <span>{email}</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Primary Email</span>
        </div>

        {!emailStatusLoading && (
          emailVerified ? (
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
          ) : (
            <button
              onClick={handleSendCode}
              className="text-sm text-blue-600 hover:underline"
              disabled={timer > 0}
            >
              {timer > 0 ? `Resend in ${timer}s` : 'Send Code'}
            </button>
          )
        )}
      </div>

      {!emailStatusLoading && !emailVerified && codeSent && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter verification code"
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <button
            onClick={handleConfirmCode}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
            disabled={submitting}
          >
            {submitting ? (
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            ) : (
              'Verify'
            )}
          </button>
        </div>
      )}

      {message && (
        <p className="text-sm text-center text-gray-700 dark:text-gray-300 mt-2">
          {message}
        </p>
      )}
    </div>
  );
}
