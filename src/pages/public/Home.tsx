import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Users, 
  BadgeCheck,
  Sparkles,
  Crown,
  Award,
  Star,
  Shield,
  Heart,
  Gem
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { staffData, serviceData } from '@/mocks';
import { ReviewsSection } from '@/features/public/ReviewsSection';
import { useApi } from '@/hooks/useApi';
import { getAllServices, Service } from '@/api/services/serviceService';
import { ServicesShadCarousel } from '@/components/ServicesShadCarousel';

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
  const {
    data: fetchedServices,
    execute: fetchServices
  } = useApi(getAllServices);

  // Fetch first 8 services on mount
  useEffect(() => {
    fetchServices(1, 8, 'name_asc');
  }, [fetchServices]);

  const featuredServices: Service[] = (fetchedServices?.services || serviceData).slice(0, 8);
  const featuredStaff = staffData.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden shadow-2xl">
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
            className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/70 to-black/60"
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
            className="space-y-8 flex flex-col h-full"
          >
            <motion.h1 
              variants={fadeIn}
              className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Modern Cuts
              <span className="block text-primary-foreground/80">for the Modern Man</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-lg sm:text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8"
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
                  className="text-white hover:text-white"
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
                  className="text-white hover:text-white"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Services
                </motion.a>
              </Button>
            </motion.div>

            <motion.div 
              variants={fadeIn}
              className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-5 md:gap-8 mt-auto items-center"
            >
              {[
                { type: 'stat', value: '10+', label: 'Expert Barbers' },
                { type: 'stat', value: '5000+', label: 'Happy Clients' },
                { type: 'logo' },
                { type: 'stat', value: '4.9', label: 'Rating' },
                { type: 'stat', value: '15+', label: 'Years Experience' },
              ].map((item, index) => (
                item.type === 'stat' ? (
                  <motion.div
                    key={index}
                    className="text-white/90 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">{item.value}</div>
                    <div className="text-xs sm:text-sm md:text-base text-white/70">{item.label}</div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={index}
                    className="flex justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    >
                      <img
                        src="/logo/logo-tran.png"
                        alt="Gentlemen's House Logo"
                        className="h-[10.5rem] w-auto drop-shadow-md"
                      />
                  </motion.div>
                )
              ))}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-0 left-0 w-full h-[16rem] bg-gradient-to-t from-black/90 via-black/70 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />
      </section>

      <section className="py-20 bg-white">
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
              <Badge className="mb-4">Why Choose Us</Badge>
              <h2 className="text-3xl font-bold mb-4">The Modern Cuts Experience</h2>
              <p className="text-muted-foreground">
                Discover what makes us the premier choice for modern gentlemen
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Shield,
                  title: "Expert Barbers",
                  description: "Our team of skilled professionals brings years of experience to every cut",
                  image: "https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg"
                },
                {
                  icon: Gem,
                  title: "Premium Products",
                  description: "We use only the finest grooming products for the best results",
                  image: "https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg"
                },
                {
                  icon: Heart,
                  title: "Personalized Service",
                  description: "Tailored grooming experience to match your unique style",
                  image: "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg"
                },
                {
                  icon: BadgeCheck,
                  title: "Satisfaction Guaranteed",
                  description: "Your satisfaction is our top priority, always",
                  image: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={serviceCard}
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-2 border-transparent group rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img 
                        src={feature.image + '?auto=compress&cs=tinysrgb&w=1080'} 
                        alt={feature.title}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    </div>
                    <CardContent className="p-6 relative">
                      <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-14 h-14 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors duration-300">
                          <feature.icon className="h-7 w-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                        <p className="text-muted-foreground text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              variants={{
                initial: { opacity: 0, x: -50 },
                animate: { 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }
                }
              }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="aspect-[4/5] relative rounded-lg overflow-hidden"
                >
                  <img
                    src="https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg?auto=compress&cs=tinysrgb&w=1080"
                    alt="Barber at work"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="aspect-[4/5] relative rounded-lg overflow-hidden mt-8"
                >
                  <img
                    src="https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg?auto=compress&cs=tinysrgb&w=1080"
                    alt="Barber tools"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </motion.div>
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-8 right-0 md:-right-8 bg-white rounded-lg shadow-xl p-6 max-w-[240px]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">15+</div>
                    <div className="text-sm text-muted-foreground">Years of Excellence</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    <span className="text-sm">4.9 Average Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <span className="text-sm">5000+ Happy Clients</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              variants={{
                initial: { opacity: 0, x: 50 },
                animate: { 
                  opacity: 1, 
                  x: 0,
                  transition: {
                    type: "spring",
                    stiffness: 100,
                    damping: 20
                  }
                }
              }}
              className="space-y-6 bg-white/80 backdrop-blur-md rounded-xl shadow-xl p-8"
            >
              <Badge>About Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                A Legacy of Excellence in
                <span className="block">Modern Grooming</span>
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Since 2010, Modern Cuts has been redefining the art of men's grooming. 
                  What started as a single chair has grown into a premium destination for 
                  discerning gentlemen who appreciate quality, style, and exceptional service.
                </p>
                <p>
                  Our journey is built on a foundation of expertise, innovation, and an 
                  unwavering commitment to client satisfaction. Every cut, every shave, 
                  and every service is delivered with precision and personalized attention.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-6">
                {[
                  {value:'10+', label:'Expert Barbers'},
                  {value:'15k+', label:'Haircuts Done'},
                  {value:'98%', label:'Client Satisfaction'},
                  {value:'12+', label:'Industry Awards'}
                ].map((stat,index)=>(
                  <div key={index} className="space-y-2 hover:scale-105 transition-transform duration-300">
                    <div className="text-2xl font-extrabold text-secondary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="pt-6">
                <Button size="lg" asChild>
                  <motion.a
                    href="/about"
                    className="text-white hover:text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Learn More About Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.a>
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

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
              <Badge className="mb-4">Our Services</Badge>
              <h2 className="text-3xl font-bold mb-4">Premium Grooming Services</h2>
              <p className="text-muted-foreground">
                Experience the art of grooming with our expert barbers
              </p>
            </motion.div>

            <div className="-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-16 pb-8">
              <ServicesShadCarousel services={featuredServices} />
            </div>

            <motion.div
              variants={fadeIn}
              className="text-center mt-8"
            >
              <Button variant="outline" size="lg" asChild>
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
                  whileHover="hover"
                  viewport={{ once: true }}
                >
                  <Card className="h-full overflow-hidden border-2 hover:border-primary/50 transition-colors">
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={`${staff.image}?auto=compress&cs=tinysrgb&w=1080`}
                        alt={staff.name}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <CardContent className="p-6 relative">
                      <Badge variant={staff.isAvailable ? "default" : "outline"} className="mb-3">
                        {staff.isAvailable ? 'Available' : 'Unavailable'}
                      </Badge>
                      <h3 className="text-lg font-semibold mb-1">{staff.name}</h3>
                      <p className="text-muted-foreground text-sm mb-3">{staff.role}</p>
                      <p className="text-sm text-muted-foreground line-clamp-2">{staff.bio}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </motion.div>
        
        <div className="container mx-auto px-4 relative">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <motion.div
              variants={fadeIn}
              className="text-white space-y-6"
            >
              <Badge variant="secondary">The Experience</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">
                More Than Just a Haircut
              </h2>
              <p className="text-white/80 text-lg">
                Step into our modern sanctuary where style meets relaxation. 
                Experience premium grooming services in an atmosphere designed for the modern gentleman.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Crown, text: "Premium grooming products" },
                  { icon: BadgeCheck, text: "Skilled professional barbers" },
                  { icon: Sparkles, text: "Relaxing atmosphere" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary-foreground" />
                    <span className="text-white/80">{item.text}</span>
                  </div>
                ))}
              </div>
              <Button 
                variant="secondary"
                size="lg"
                className="mt-4"
                asChild
              >
                <motion.a
                  href="/booking"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Your Experience
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              </Button>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="relative aspect-[4/3] bg-white/10 rounded-lg backdrop-blur-sm p-8"
            >
              <img
                src="https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg?auto=compress&cs=tinysrgb&w=1080"
                alt="Barber Shop Interior"
                loading="lazy"
                decoding="async"
                className="rounded-lg object-cover w-full h-full"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

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
                className="relative aspect-video rounded-lg overflow-hidden"
              >
                <img
                  src="https://images.pexels.com/photos/1634843/pexels-photo-1634843.jpeg?auto=compress&cs=tinysrgb&w=1080"
                  alt="Shop Location"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">Visit Our Shop</h3>
                  <p className="text-white/80">Experience premium grooming services</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-muted/30"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center max-w-2xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
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
            
            <Button size="lg" asChild>
              <motion.a
                href="/booking"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book Your Visit
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.a>
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Reviews Section */}
      <ReviewsSection />
    </div>
  );
};

