import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, ChevronRight, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { serviceData } from '@/mocks';
import { formatCurrency } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Services
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto">
              Premium grooming services tailored to your style
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
                <ArrowRight className="ml-2 h-5 w-5" />
              </motion.a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12">
        <div className="container mx-auto px-6 max-w-[1400px]">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {Object.entries(groupedServices).map(([category, services], index) => (
              <Card 
                key={category} 
                className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
              >
                <div className="grid md:grid-cols-12 gap-0">
                  <div className={`md:col-span-6 relative h-[200px] md:h-[500px] ${index % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                    <img 
                      src={categoryImages[category as keyof typeof categoryImages]}
                      alt={category}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <h2 className="text-2xl font-bold text-white capitalize">
                        {category}
                      </h2>
                    </div>
                  </div>

                  <div className={`md:col-span-6 ${index % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                    <ScrollArea className="h-[400px] md:h-[500px]">
                      <div className="divide-y divide-border">
                        {services.map((service) => (
                          <motion.div
                            key={service.id}
                            variants={serviceRow}
                            initial="initial"
                            animate="animate"
                            whileHover="hover"
                            className="px-8 py-5 flex items-center justify-between group cursor-pointer hover:bg-primary/5 transition-colors duration-200"
                          >
                            <div className="flex-1 min-w-0 mr-6">
                              <div className="flex items-center gap-4">
                                <Scissors className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                <div>
                                  <h3 className="font-medium group-hover:text-primary transition-colors">
                                    {service.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground mt-1 group-hover:text-foreground/80 transition-colors line-clamp-2">
                                    {service.description}
                                  </p>
                                  <div className="flex items-center gap-4 mt-2">
                                    <Badge variant="secondary" className="text-xs group-hover:bg-primary/10 transition-colors">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {service.duration} min
                                    </Badge>
                                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                                      {formatCurrency(service.price)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-all duration-200 group-hover:bg-primary/10"
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
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-16 bg-primary text-primary-foreground"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Experience Premium Grooming?
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