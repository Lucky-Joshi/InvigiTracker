import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">InvigiTracker</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create your admin account
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'w-full',
              card: 'rounded-2xl shadow-soft-md border border-slate-200 dark:border-slate-700',
              formButtonPrimary: 'bg-blue-600 hover:bg-blue-700',
              formFieldInput: 'rounded-lg border-slate-300 dark:border-slate-600',
            },
          }}
        />
      </div>
    </div>
  );
}
