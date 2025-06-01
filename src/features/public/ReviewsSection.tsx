import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { reviewsData } from '@/mocks';
import { cn } from '@/lib/utils';

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

export const ReviewsSection: React.FC = () => {
  // Filter reviews that are approved
  const approvedReviews = reviewsData.filter(review => 
    review.status === 'approved'
  );
  
  // Get reviews to display (limited to 6)
  const displayReviews = approvedReviews.slice(0, 6);
  
  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };
  
  return (
    <section className="py-16 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="space-y-12"
        >
          <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto mb-12">
            <Badge className="mb-4">Testimonials</Badge>
            <h2 className="text-3xl font-bold mb-4">What Our Customers Say</h2>
            <p className="text-muted-foreground">
              Don't just take our word for it - hear from our satisfied customers about their experiences
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayReviews.map((review) => (
              <motion.div
                key={review.id}
                variants={fadeIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <Card className="h-full">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          {review.profileImage ? (
                            <AvatarImage src={review.profileImage} alt={review.customerName} />
                          ) : (
                            <AvatarFallback>
                              {review.customerName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium">{review.customerName}</p>
                          <div className="mt-1">{renderStars(review.rating)}</div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="flex-grow text-muted-foreground">
                      "{review.reviewText}"
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <motion.div variants={fadeIn} className="text-center mt-8">
            <Badge variant="outline" className="text-md px-3 py-1">
              Join our happy customers today!
            </Badge>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}; 