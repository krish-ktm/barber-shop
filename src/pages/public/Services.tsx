import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock } from 'lucide-react';
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
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
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
            className="space-y-32"
          >
            {Object.entries(groupedServices).map(([category, services], index) => (
              <motion.div 
                key={category}
                variants={fadeIn}
                className="grid lg:grid-cols-2 gap-12 items-center"
              >
                {/* Image Section */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`relative h-[600px] rounded-2xl overflow-hidden ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}
                >
                  <img
                    src={`https://images.pexels.com/photos/${1570807 + index}/pexels-photo-${1570807 + index}.jpeg`}
                    alt={category}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <Badge variant="outline" className="mb-4 text-lg px-6 py-2 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                      {category}
                    </Badge>
                    <h2 className="text-4xl font-bold capitalize">
                      Premium {category} Services
                    </h2>
                  </div>
                </motion.div>

                {/* Services List */}
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? 50 : -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className={`space-y-8 ${index % 2 === 0 ? 'lg:order-2' : 'lg:order-1'}`}
                >
                  {services.map((service) => (
                    <motion.div
                      key={service.id}
                      variants={serviceCard}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      viewport={{ once: true }}
                    >
                      <Card className="group overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                        <div className="p-6">
                          <div className="flex flex-col space-y-4">
                            {/* Service Header */}
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-semibold group-hover:text-primary transition-colors">
                                  {service.name}
                                </h3>
                                <div className="flex items-center gap-4">
                                  <Badge variant="secondary" className="text-base px-4 py-1">
                                    {formatCurrency(service.price)}
                                  </Badge>
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {service.duration} min
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Service Description */}
                            <p className="text-muted-foreground text-base leading-relaxed">
                              {service.description}
                            </p>

                            {/* Service Footer */}
                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-sm">
                                  {service.category}
                                </Badge>
                                <Badge variant="outline" className="text-sm">
                                  Popular
                                </Badge>
                              </div>
                              <Button 
                                variant="default" 
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-all duration-300"
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
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
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
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-3xl mx-auto space-y-8"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              Ready to Transform Your Look?
            </motion.h2>
            
            <motion.p 
              variants={fadeIn}
              className="text-primary-foreground/80 text-xl max-w-2xl mx-auto mb-8"
            >
              Book your appointment now and experience our premium grooming services
            </motion.p>
            
            <motion.div variants={fadeIn}>
              <Button 
                size="lg" 
                variant="secondary"
                className="min-w-[250px] h-14 text-lg"
                asChild
              >
                <motion.a
                  href="/booking"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Your Appointment
                  <ArrowRight className="h-5 w-5 ml-2" />
                </motion.a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};