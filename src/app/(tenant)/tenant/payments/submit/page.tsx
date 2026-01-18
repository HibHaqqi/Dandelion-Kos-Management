import { PaymentSubmitForm } from './payment-submit-form';

export default function SubmitPaymentPage() {
  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Submit Payment
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Upload your payment receipt and enter the payment details
        </p>
      </div>

      <PaymentSubmitForm />
    </div>
  );
}
