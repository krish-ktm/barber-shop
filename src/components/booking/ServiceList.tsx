import { useState } from 'react';
import { Service } from '@/data/services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface ServiceListProps {
  services: Service[];
  onSelect: (serviceId: string) => void;
}

export default function ServiceList({ services, onSelect }: ServiceListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Get unique categories
  const categories = Array.from(new Set(services.map(service => service.category)));
  
  // Filter services by search term
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Select a Service</h2>
        <p className="text-muted-foreground">
          Choose the service you're looking for
        </p>
      </div>
      
      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search services..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Service categories and list */}
      <Tabs defaultValue={categories[0]} className="w-full">
        <TabsList className="w-full mb-6 grid grid-cols-2 md:grid-cols-4">
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="text-sm">
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {categories.map(category => (
          <TabsContent key={category} value={category} className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredServices
                .filter(service => service.category === category)
                .map(service => (
                  <div 
                    key={service.id}
                    className="border rounded-lg p-4 hover:border-primary cursor-pointer transition-colors"
                    onClick={() => onSelect(service.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{service.name}</h3>
                      <span className="font-semibold">${service.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {service.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">
                        {service.duration} mins
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => onSelect(service.id)}>
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}