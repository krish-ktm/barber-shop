import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Clock, Search, Star, Scissors, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { staffData, serviceData } from '@/mocks';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatCurrency } from '@/utils';
import { Link } from 'react-router-dom';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
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

export const Barbers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBarber, setSelectedBarber] = useState<typeof staffData[0] | null>(null);

  // Filter barbers based on search query
  const filteredBarbers = staffData.filter(barber => 
    barber.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    barber.position.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get services for a barber
  const getBarberServices = (serviceIds: string[]) => {
    return serviceData.filter(service => serviceIds.includes(service.id));
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary text-primary-foreground overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg')] bg-cover bg-fixed bg-center"
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
            animate="animate"
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div variants={fadeIn}>
              <Badge className="mb-4">Our Team</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Meet Our Expert Barbers
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Our skilled team of professionals is dedicated to providing you with the best grooming experience
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Team Grid Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {staffData.map((staff) => (
              <motion.div
                key={staff.id}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="overflow-hidden h-full">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={staff.image}
                      alt={staff.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {staff.position}
                      </Badge>
                      <h3 className="text-xl font-semibold">{staff.name}</h3>
                      <p className="text-muted-foreground mt-2">
                        {staff.bio}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{staff.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>{staff.email}</span>
                      </div>
                    </div>

                    <Button asChild className="w-full">
                      <Link to="/booking">
                        Book Appointment
                        <Calendar className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto"
          >
            <motion.div variants={fadeIn} className="space-y-6">
              <h2 className="text-3xl font-bold">Ready for a Fresh Look?</h2>
              <p className="text-muted-foreground">
                Book an appointment with one of our expert barbers and experience the best in men's grooming
              </p>
              <Button size="lg" asChild>
                <Link to="/booking">
                  Book Your Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};