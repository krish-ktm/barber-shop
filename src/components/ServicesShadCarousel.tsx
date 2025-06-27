import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Scissors } from 'lucide-react';
import { motion } from 'framer-motion';
import { Service } from '@/api/services/serviceService';
import { formatCurrency } from '@/utils/formatters';

// CarouselApi type is internal, use unknown to store instance safely
type CarouselApiType = unknown;

interface ServicesShadCarouselProps {
  services: Service[];
}

export const ServicesShadCarousel: React.FC<ServicesShadCarouselProps> = ({ services }) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApiType | null>(null);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  useEffect(() => {
    if (!carouselApi || typeof (carouselApi as { scrollNext?: () => void }).scrollNext !== 'function') return;

    const id = setInterval(() => {
      (carouselApi as { scrollNext: () => void }).scrollNext();
    }, 4000);

    return () => clearInterval(id);
  }, [carouselApi]);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return (
    <Carousel
      className="relative px-4 md:px-6"
      opts={{ loop: true, align: 'start' }}
      setApi={(api) => setCarouselApi(api as CarouselApiType)}
    >
      <CarouselContent className="py-4">
        {services.map((service) => (
          <CarouselItem key={service.id} className="pl-4 md:pl-6 basis-4/5 sm:basis-1/3 lg:basis-1/4 overflow-visible">
            <motion.div whileHover={{ scale: 1.02 }} className="h-full z-10 relative">
              <Card className="h-full border hover:border-primary transition-colors shadow-sm flex flex-col">
                <div className="aspect-[4/3] bg-muted/50 relative overflow-hidden">
                  <img
                    src={`https://source.unsplash.com/600x450/?barber,${service.category}`}
                    alt={service.name}
                    className="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground text-sm flex-1 mb-4 line-clamp-3">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {service.duration} min
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(service.price)}
                    </span>
                  </div>
                  <Button variant="secondary" size="sm" asChild className="mt-auto w-full">
                    <motion.a
                      href="/booking"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-center gap-1"
                    >
                      Book
                      <Scissors className="h-4 w-4" />
                    </motion.a>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* Arrows removed for cleaner mobile UI */}
    </Carousel>
  );
}; 