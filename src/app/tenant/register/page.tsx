import { RegisterForm } from './register-form';

export default function TenantRegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tenant Registration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create your tenant account to manage payments and requests
            </p>
          </div>

          <RegisterForm />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium text-teal-600 hover:text-teal-500 dark:text-teal-400"
              >
                Sign in
              </a>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you an admin?{' '}
              <a
                href="/register"
                className="font-medium text-cyan-600 hover:text-cyan-500 dark:text-cyan-400"
              >
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
