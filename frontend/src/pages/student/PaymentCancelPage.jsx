import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';

const PaymentCancelPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full text-center">
        {/* Error icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-error-50 flex items-center justify-center mb-6">
          <XCircle className="w-10 h-10 text-error-500" />
        </div>

        <h1 className="text-2xl font-bold text-surface-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-surface-800/60 mb-3">
          Your payment was not completed. No charges have been made to your account.
        </p>
        <p className="text-sm text-surface-800/40 mb-8">
          If this was a mistake, you can return to your cart and try again. 
          If you continue experiencing issues, please contact our support team.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/cart">
            <Button icon={ShoppingCart}>Return to Cart</Button>
          </Link>
          <Link to="/courses">
            <Button variant="outline" icon={ArrowRight}>Browse Courses</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
