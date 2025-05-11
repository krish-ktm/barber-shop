import { Link } from 'react-router-dom';
import { ChevronRight, Clock, Scissors, Star, UserCheck } from 'lucide-react';
import { services } from '@/data/services';
import { barbers } from '@/data/barbers';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  // Featured services (show first 4)
  const featuredServices = services.slice(0, 4);
  
  // Featured barbers (show first 3)
  const featuredBarbers = barbers.slice(0, 3);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div 
          className="h-[600px] bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/668196/pexels-photo-668196.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" 
          }}
        />
        <div className="container absolute inset-0 z-20 flex flex-col justify-center items-start">
          <div className="max-w-xl text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Premium Barbershop Experience
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Classic cuts, modern styles, and expert grooming for the modern gentleman.
            </p>
            <div className="flex gap-4">
              <Link to="/book">
                <Button size="lg" className="text-lg">
                  Book Now
                </Button>
              </Link>
              <Link to="#services">
                <Button variant="outline" size="lg" className="text-lg bg-transparent text-white hover:bg-white/10 border-white">
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/40">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-4">
                  <Scissors className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Expert Barbers</h3>
                <p className="text-muted-foreground">
                  Our team of skilled professionals are masters of their craft with years of experience.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-4">
                  <Clock className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Convenient Booking</h3>
                <p className="text-muted-foreground">
                  Easy online appointments make scheduling your next visit quick and hassle-free.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6 text-center">
                <div className="flex justify-center mb-4">
                  <UserCheck className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Premium Experience</h3>
                <p className="text-muted-foreground">
                  Enjoy complimentary beverages and a relaxing atmosphere during your visit.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="services" className="py-20">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold">Our Services</h2>
              <p className="text-muted-foreground">Professional grooming services for every style</p>
            </div>
            <Link to="#" className="mt-4 md:mt-0 flex items-center text-primary hover:underline">
              <span>View all services</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredServices.map((service) => (
              <Card key={service.id} className="overflow-hidden border-0 shadow-lg">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105" 
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold">{service.name}</h3>
                    <span className="font-semibold">${service.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{service.duration} mins</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* Team Section */}
      <section className="py-20 bg-muted/40">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-4">Meet Our Barbers</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Our experienced team of professionals are dedicated to providing you with the best service.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featuredBarbers.map((barber) => (
              <Card key={barber.id} className="border-0 shadow-lg overflow-hidden">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={barber.image}
                    alt={barber.name}
                    className="w-full h-full object-cover transition-transform hover:scale-105" 
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-1">{barber.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{barber.title}</p>
                  <div className="flex items-center mb-4">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="ml-2 text-sm">{barber.rating}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{barber.bio}</p>
                  <div className="flex flex-wrap gap-2">
                    {barber.specialties.slice(0, 3).map((specialty, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-secondary rounded-full text-xs"
                      >
                        {specialty}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for a Fresh Look?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-xl mx-auto">
            Book your appointment today and experience the best haircut in town.
          </p>
          <Link to="/book">
            <Button variant="secondary" size="lg" className="text-lg">
              Book an Appointment
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}