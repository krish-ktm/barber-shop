import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePublicStaff } from '@/hooks/usePublicStaff';
import { Link } from 'react-router-dom';
import { Loader } from '@/components/ui/loader';

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

export const Barbers: React.FC = () => {
  const { staff, loading: staffLoading, error: staffError } = usePublicStaff();

  const isFetching = staffLoading || staff.length === 0;

  if (isFetching) {
    return <Loader className="min-h-screen" size={48} />;
  }

  if (staffError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load barbers: {staffError.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-primary text-primary-foreground overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg')] bg-cover bg-fixed bg-center"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </motion.div>
        
        <div className="container mx-auto px-4 relative z-10">
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
            {staff.map((staff) => (
              <motion.div
                key={staff.id}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Card className="overflow-hidden h-full">
                  <div className="aspect-[4/3] relative overflow-hidden">
                    <img
                      src={staff.image || 'https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg'}
                      alt={staff.name || 'Barber'}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {staff.position ?? 'Barber'}
                      </Badge>
                      <h3 className="text-xl font-semibold">{staff.name ?? staff.user?.name ?? 'Our Barber'}</h3>
                      {staff.bio && (
                        <p className="text-muted-foreground mt-2 line-clamp-3">
                          {staff.bio}
                        </p>
                      )}

                      {Array.isArray(staff.services) && staff.services.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {staff.services.map((svc) => (
                            <Badge key={svc.id} variant="outline" className="text-xs">
                              {svc.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {(staff.phone || staff.email) && (
                      <div className="space-y-2 text-sm text-muted-foreground">
                        {staff.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{staff.phone}</span>
                          </div>
                        )}
                        {staff.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span>{staff.email}</span>
                          </div>
                        )}
                      </div>
                    )}

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