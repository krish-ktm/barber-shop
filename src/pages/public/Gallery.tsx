import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const imageCard = {
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

export const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const galleryImages = [
    {
      url: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg',
      category: 'Haircuts',
      title: 'Classic Fade',
    },
    {
      url: 'https://images.pexels.com/photos/1570807/pexels-photo-1570807.jpeg',
      category: 'Styling',
      title: 'Modern Quiff',
    },
    {
      url: 'https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg',
      category: 'Beard',
      title: 'Beard Grooming',
    },
    {
      url: 'https://images.pexels.com/photos/3998429/pexels-photo-3998429.jpeg',
      category: 'Shop',
      title: 'Our Space',
    },
    {
      url: 'https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg',
      category: 'Tools',
      title: 'Professional Equipment',
    },
    {
      url: 'https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg',
      category: 'Haircuts',
      title: 'Textured Crop',
    },
    {
      url: 'https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg',
      category: 'Styling',
      title: 'Pompadour',
    },
    {
      url: 'https://images.pexels.com/photos/1634843/pexels-photo-1634843.jpeg',
      category: 'Shop',
      title: 'Barber Station',
    },
    {
      url: 'https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg',
      category: 'Haircuts',
      title: 'Skin Fade',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        <motion.div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: 'url(https://images.pexels.com/photos/1634843/pexels-photo-1634843.jpeg)',
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
              Our Gallery
              <span className="block text-primary-foreground/80">Portfolio</span>
            </motion.h1>
            
            <motion.p 
              variants={fadeIn}
              className="text-xl md:text-2xl text-white/80 max-w-2xl mx-auto mb-8"
            >
              Showcasing our finest work and craftsmanship
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
                { value: '1000+', label: 'Happy Clients' },
                { value: '5000+', label: 'Haircuts' },
                { value: '4.9', label: 'Rating' },
                { value: '10+', label: 'Awards' },
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

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-16"
          >
            <motion.div 
              variants={fadeIn}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <Badge className="mb-4">Our Work</Badge>
              <h2 className="text-3xl font-bold mb-4">Latest Masterpieces</h2>
              <p className="text-muted-foreground">
                Browse through our collection of premium cuts and styles
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image, index) => (
                <motion.div
                  key={index}
                  variants={imageCard}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  viewport={{ once: true }}
                  onClick={() => setSelectedImage(image.url)}
                >
                  <Card className="group h-full overflow-hidden border-2 hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Plus className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="p-4">
                      <Badge variant="secondary" className="mb-2">
                        {image.category}
                      </Badge>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">
                        {image.title}
                      </h3>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* CTA Section */}
            <motion.div
              variants={fadeIn}
              className="text-center mt-12"
            >
              <p className="text-muted-foreground mb-6">
                Ready to experience our premium grooming services?
              </p>
              <Button 
                size="lg"
                asChild
              >
                <motion.a
                  href="/booking"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Book Your Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Image Lightbox */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-0">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-50 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <Plus className="h-6 w-6 rotate-45" />
          </Button>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Gallery preview"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};