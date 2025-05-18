import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { serviceData } from '@/mocks';
import { formatCurrency } from '@/utils';

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

const serviceCard = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: { 
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10
    }
  }
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
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg)',
          }}
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <motion.h1 
              variants={fadeIn}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Premium Grooming
              <span className="block text-primary-foreground/80">Services</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8"
            >
              Experience the art of grooming with our expert barbers
            </motion.p>
            
            <motion.div
              variants={fadeIn}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Button 
                size="lg" 
                className="text-lg px-8 h-12"
                asChild
              >
                <motion.a 
                  href="#services"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Services
                </motion.a>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 h-12 bg-white/10 hover:bg-white/20 text-white border-white/20"
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
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={fadeIn}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
            >
              {[
                { value: '10+', label: 'Expert Barbers' },
                { value: '5000+', label: 'Happy Clients' },
                { value: '4.9', label: 'Rating' },
                { value: '15+', label: 'Years Experience' },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-white/90"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-sm md:text-base text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      </section>

      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-16"
          >
            {Object.entries(groupedServices).map(([category, services]) => (
              <motion.div 
                key={category}
                variants={fadeIn}
                className="space-y-8"
              >
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold capitalize">{category}</h2>
                  <div className="flex-1 border-t border-border" />
                </div>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((service) => (
                    <motion.div
                      key={service.id}
                      variants={serviceCard}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      viewport={{ once: true }}
                    >
                      <Card className="group h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                        <div className="p-6 flex flex-col h-full">
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-2">
                              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                                {service.name}
                              </h3>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                                  />
                                ))}
                              </div>
                              <p className="text-muted-foreground text-sm line-clamp-2">
                                {service.description}
                              </p>
                            </div>
                            <Badge variant="secondary" className="shrink-0">
                              {formatCurrency(service.price)}
                            </Badge>
                          </div>
                          
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {service.duration} min
                            </div>
                            <Button 
                              variant="ghost" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <motion.a
                                href="/booking"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Book Now
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </motion.a>
                            </Button>
                          </div>
                        </div>
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
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Ready to Look Your Best?
            </motion.h2>
            
            <motion.p 
              variants={fadeIn}
              className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8"
            >
              Book your appointment now and experience our premium grooming services
            </motion.p>
            
            <motion.div variants={fadeIn}>
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
                  Book Appointment
                  <ArrowRight className="h-4 w-4 ml-2" />
                </motion.a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};