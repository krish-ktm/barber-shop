import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Star, Scissors, Users, DollarSign, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { staffData } from '@/mocks';

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

const cardVariant = {
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

export const About: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg)',
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
              Our Story
              <span className="block text-primary-foreground/80">Since 2010</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8"
            >
              A tradition of excellence in men's grooming
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
                </motion.a>
              </Button>
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

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              variants={fadeIn}
              className="space-y-6"
            >
              <Badge className="h-8 text-base px-4">Est. 2010</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">A Cut Above the Rest</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Founded in 2010, Modern Cuts has been at the forefront of men's grooming,
                  combining traditional barbering techniques with contemporary styles.
                </p>
                <p>
                  Our commitment to excellence and attention to detail has made us the
                  preferred choice for discerning gentlemen who appreciate quality grooming
                  services.
                </p>
                <p>
                  What started as a single chair has grown into a premium barbershop,
                  thanks to our dedicated team of skilled barbers and loyal customers.
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="grid grid-cols-2 gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <img
                  src="https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg"
                  alt="Barbershop interior"
                  className="rounded-lg w-full h-64 object-cover"
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="mt-8"
              >
                <img
                  src="https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg"
                  alt="Barber tools"
                  className="rounded-lg w-full h-64 object-cover"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
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
              className="text-center max-w-2xl mx-auto"
            >
              <Badge className="mb-4">Our Values</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">What Sets Us Apart</h2>
              <p className="text-muted-foreground">
                Our core values define who we are and guide everything we do
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Star,
                  title: 'Excellence',
                  description: 'We strive for perfection in every cut, ensuring each client leaves looking and feeling their best.'
                },
                {
                  icon: Clock,
                  title: 'Professionalism',
                  description: 'Our experienced team maintains the highest standards of service and cleanliness.'
                },
                {
                  icon: Award,
                  title: 'Community',
                  description: "We're proud to be part of our local community, creating a welcoming space for all."
                }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  variants={cardVariant}
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="pt-6 p-6">
                      <value.icon className="h-12 w-12 mb-4 text-primary" />
                      <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
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
              className="text-center max-w-2xl mx-auto"
            >
              <Badge className="mb-4">Our Team</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Expert Team</h2>
              <p className="text-muted-foreground">
                Our skilled professionals are here to provide you with the best grooming experience
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8">
              {staffData.map((staff, index) => (
                <motion.div
                  key={staff.id}
                  variants={cardVariant}
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
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-4 gap-8 text-center"
          >
            {[
              { icon: Clock, value: '10+', label: 'Years Experience' },
              { icon: Users, value: '5000+', label: 'Happy Clients' },
              { icon: Scissors, value: '15+', label: 'Expert Barbers' },
              { icon: Star, value: '4.9', label: 'Average Rating' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="space-y-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <stat.icon className="h-8 w-8 mx-auto mb-4 opacity-80" />
                <div className="text-4xl font-bold">{stat.value}</div>
                <div className="text-primary-foreground/80">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20"
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
              className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
            >
              Book your appointment now and discover why we're the preferred choice for modern gentlemen
            </motion.p>
            
            <motion.div variants={fadeIn}>
              <Button 
                size="lg" 
                className="min-w-[200px]"
                asChild
              >
                <motion.a
                  href="/booking"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Your Visit
                </motion.a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};