import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { serviceData } from '@/mocks';
import { formatCurrency } from '@/utils';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const Services: React.FC = () => {
  // Group services by category
  const groupedServices = serviceData.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<string, typeof serviceData>);

  return (
    <div>
      {/* Hero Section */}
      <motion.section 
        className="relative h-[60vh] flex items-center justify-center text-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg)',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Our Services
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Premium grooming services tailored to your style
          </motion.p>
        </div>
      </motion.section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-16"
          >
            {Object.entries(groupedServices).map(([category, services]) => (
              <motion.div key={category} variants={item}>
                <div className="flex items-center gap-4 mb-8">
                  <h2 className="text-3xl font-bold capitalize">{category}</h2>
                  <div className="flex-1 border-t border-border" />
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <motion.div
                      key={service.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card className="group overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-2">
                              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                {service.name}
                              </h3>
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {service.description}
                              </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {formatCurrency(service.price)}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {service.duration} min
                            </div>
                            <Button 
                              variant="ghost" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Book Now
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-primary text-primary-foreground"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Look Your Best?</h2>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
            Book your appointment now and experience our premium grooming services
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="min-w-[200px]"
          >
            Book Appointment
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </motion.section>
    </div>
  );
};