import React from 'react';
import { Clock, MapPin, Star } from 'lucide-react';
import { staffData } from '@/mocks';
import { Card, CardContent } from '@/components/ui/card';

export const About: React.FC = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg)',
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Story</h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto">
            A tradition of excellence in men's grooming since 2010
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">A Cut Above the Rest</h2>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg"
                alt="Barbershop interior"
                className="rounded-lg w-full h-64 object-cover"
              />
              <img
                src="https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg"
                alt="Barber tools"
                className="rounded-lg w-full h-64 object-cover mt-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <Star className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Excellence</h3>
                <p className="text-muted-foreground">
                  We strive for perfection in every cut, ensuring each client leaves
                  looking and feeling their best.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <Clock className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Professionalism</h3>
                <p className="text-muted-foreground">
                  Our experienced team maintains the highest standards of service
                  and cleanliness.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <MapPin className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">Community</h3>
                <p className="text-muted-foreground">
                  We're proud to be part of our local community, creating a welcoming
                  space for all.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Expert Team</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {staffData.map((staff) => (
              <Card key={staff.id} className="overflow-hidden">
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={staff.image}
                    alt={staff.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{staff.name}</h3>
                  <p className="text-muted-foreground mb-4">{staff.position}</p>
                  <p className="text-sm text-muted-foreground">{staff.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-primary-foreground/80">Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5000+</div>
              <div className="text-primary-foreground/80">Happy Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-primary-foreground/80">Expert Barbers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">4.9</div>
              <div className="text-primary-foreground/80">Average Rating</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};