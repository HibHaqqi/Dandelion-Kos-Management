import { ComplaintForm } from '../complaint-form';

export default function NewComplaintPage() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Submit Complaint
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Report an issue or request maintenance
        </p>
      </div>

      <ComplaintForm />
    </div>
  );
}
