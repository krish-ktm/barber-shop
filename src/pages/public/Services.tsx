import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { serviceData } from '@/mocks';
import { formatCurrency } from '@/utils';

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    }
  }
};

const serviceRow = {
  initial: { opacity: 0, x: -20 },
  animate: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: { 
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    transition: {
      duration: 0.2
    }
  }
};

// Category images mapping
const categoryImages = {
  haircut: "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg",
  beard: "https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg",
  shave: "https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg",
  color: "https://images.pexels.com/photos/3997386/pexels-photo-3997386.jpeg",
  treatment: "https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg",
  combo: "https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg"
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
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-primary">
        <motion.div 
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg')] bg-cover bg-center bg-no-repeat"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Premium Services
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Experience luxury grooming tailored to your style
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-24"
          >
            {Object.entries(groupedServices).map(([category, services], index) => (
              <Card 
                key={category} 
                className="overflow-hidden border-none shadow-xl bg-card/80 backdrop-blur-sm"
              >
                <div className="grid lg:grid-cols-2 gap-0">
                  <motion.div 
                    className={`relative min-h-[400px] lg:min-h-[600px] ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <img 
                      src={categoryImages[category as keyof typeof categoryImages]}
                      alt={category}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent lg:hidden" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:hidden">
                      <h2 className="text-3xl font-bold text-white capitalize">
                        {category}
                      </h2>
                    </div>
                  </motion.div>

                  <div className={`flex flex-col ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className="p-8 hidden lg:block">
                      <h2 className="text-3xl font-bold text-foreground capitalize mb-4">
                        {category}
                      </h2>
                      <div className="w-20 h-1 bg-primary rounded-full mb-6" />
                    </div>

                    <div className="divide-y divide-border">
                      {services.map((service) => (
                        <motion.div
                          key={service.id}
                          variants={serviceRow}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                          className="px-8 py-6 flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex-1 min-w-0 mr-6">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                                {service.name}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {service.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-8">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-2" />
                              {service.duration} min
                            </div>
                            <div className="w-24 text-right font-semibold text-foreground">
                              {formatCurrency(service.price)}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <motion.a
                                href="/booking"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <ChevronRight className="h-5 w-5" />
                              </motion.a>
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-24 bg-primary text-primary-foreground"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Experience Premium Grooming
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8">
              Book your appointment today and elevate your style
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              className="min-w-[200px]"
              asChild
            >
              <motion.a
                href="/booking"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Now
                <ArrowRight className="h-5 w-5 ml-2" />
              </motion.a>
            </Button>
          </div>
        </div>
      </motion.section>
    </div>
  );
};