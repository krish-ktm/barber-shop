import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useBooking } from '../BookingContext';

interface CustomerDetailsProps {
  onNext: () => void;
  onBack: () => void;
}

export const CustomerDetails: React.FC<CustomerDetailsProps> = ({ onNext, onBack }) => {
  const { customerDetails, setCustomerDetails } = useBooking();

  // Check if required fields are filled to enable next button
  const canProceed = customerDetails.name.trim() !== '' && customerDetails.phone.trim() !== '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Your Details</h2>
        <p className="text-muted-foreground">
          Please provide your contact information
        </p>
      </div>

      <motion.div 
        className="space-y-4"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="initial"
        animate="animate"
      >
        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <Label htmlFor="name">Full Name <span className="text-destructive">*</span></Label>
          <Input
            id="name"
            value={customerDetails.name}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, name: e.target.value })
            }
            placeholder="Enter your full name"
            required
          />
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={customerDetails.email}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, email: e.target.value })
            }
            placeholder="Enter your email address"
          />
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <Label htmlFor="phone">Phone Number <span className="text-destructive">*</span></Label>
          <Input
            id="phone"
            value={customerDetails.phone}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, phone: e.target.value })
            }
            placeholder="Enter your phone number"
            required
          />
        </motion.div>

        <motion.div
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 }
          }}
        >
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            value={customerDetails.notes}
            onChange={(e) =>
              setCustomerDetails({ ...customerDetails, notes: e.target.value })
            }
            placeholder="Any special requests or notes"
          />
        </motion.div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 mt-6 border-t">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="px-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className="px-6"
        >
          Next <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
};