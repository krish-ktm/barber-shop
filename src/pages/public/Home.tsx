import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Clock, MapPin, Phone, Mail, Star, Users, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { staffData, serviceData } from '@/mocks';
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

export const Home: React.FC = () => {
  // Featured services (top 3 by bookings)
  const featuredServices = serviceData.slice(0, 3);

  // Featured staff (top 3)
  const featuredStaff = staffData.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg)',
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
              Modern Cuts
              <span className="block text-primary-foreground/80">for the Modern Man</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8"
            >
              Experience premium grooming services at our state-of-the-art barbershop
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
                  href="/booking"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </motion.a>
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 h-12 bg-white/10 hover:bg-white/20 text-white border-white/20"
                asChild
              >
                <motion.a 
                  href="/services"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Services
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

      {/* Featured Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <Badge className="mb-4">Our Services</Badge>
              <h2 className="text-3xl font-bold mb-4">Premium Grooming Services</h2>
              <p className="text-muted-foreground">
                Experience the art of grooming with our expert barbers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredServices.map((service) => (
                <motion.div
                  key={service.id}
                  variants={serviceCard}
                  initial="initial"
                  whileInView="animate"
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                            {service.name}
                          </h3>
                          <div className="flex items-center gap-1 my-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className="h-4 w-4 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {service.description}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {formatCurrency(service.price)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
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
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeIn}
              className="text-center mt-12"
            >
              <Button 
                size="lg"
                variant="outline"
                asChild
              >
                <motion.a
                  href="/services"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Staff */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <Badge className="mb-4">Our Team</Badge>
              <h2 className="text-3xl font-bold mb-4">Meet Our Experts</h2>
              <p className="text-muted-foreground">
                Our skilled professionals are here to provide you with the best grooming experience
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredStaff.map((staff) => (
                <motion.div
                  key={staff.id}
                  variants={serviceCard}
                  initial="initial"
                  whileInView="animate"
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={staff.image}
                        alt={staff.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <CardContent className="p-6 relative">
                      <Badge variant={staff.isAvailable ? "default" : "outline"} className="mb-4">
                        {staff.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                      <h3 className="text-xl font-semibold mb-1">{staff.name}</h3>
                      <p className="text-muted-foreground mb-4">{staff.position}</p>
                      <p className="text-sm text-muted-foreground line-clamp-3">{staff.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeIn}
              className="text-center mt-12"
            >
              <Button 
                size="lg"
                variant="outline"
                asChild
              >
                <motion.a
                  href="/about"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Meet the Team
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <Badge className="mb-4">Testimonials</Badge>
              <h2 className="text-3xl font-bold mb-4">What Our Clients Say</h2>
              <p className="text-muted-foreground">
                Don't just take our word for it - hear from our satisfied customers
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  variants={serviceCard}
                  initial="initial"
                  whileInView="animate"
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex">
                        {Array(5).fill(0).map((_, idx) => (
                          <Star key={idx} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <p className="text-muted-foreground">
                        "Exceptional service! The attention to detail and professional atmosphere make
                        this the best barbershop in town. I wouldn't trust anyone else with my hair."
                      </p>
                      <div className="font-semibold">John D.</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-12"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <Badge className="mb-4">Visit Us</Badge>
              <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground">
                Drop by our shop or get in touch to schedule your appointment
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <motion.div
                variants={fadeIn}
                className="space-y-6"
              >
                <Card className="p-4">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Location</h3>
                      <p className="text-muted-foreground">
                        123 Main Street<br />
                        New York, NY 10001
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start space-x-4">
                    <Clock className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Hours</h3>
                      <div className="text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Monday - Friday</span>
                          <span>9:00 AM - 8:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday</span>
                          <span>10:00 AM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday</span>
                          <span>Closed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Phone</h3>
                      <p className="text-muted-foreground">(555) 123-4567</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-primary shrink-0" />
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <p className="text-muted-foreground">info@moderncuts.com</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                variants={fadeIn}
                className="aspect-video rounded-lg overflow-hidden bg-muted"
              >
                {/* Map placeholder */}
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Map View
                </div>
              </motion.div>
            </div>
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
              Ready to Experience the Difference?
            </motion.h2>
            
            <motion.p 
              variants={fadeIn}
              className="text-primary-foreground/80 text-lg max-w-2xl mx-auto mb-8"
            >
              Book your appointment now and discover why we're the preferred choice for modern gentlemen
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
                  Book Your Visit
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