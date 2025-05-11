export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  image?: string;
}

export const services: Service[] = [
  {
    id: "s1",
    name: "Classic Haircut",
    description: "Traditional haircut with clippers and scissors.",
    price: 35,
    duration: 30,
    category: "Haircuts",
    image: "https://images.pexels.com/photos/1813272/pexels-photo-1813272.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "s2",
    name: "Beard Trim",
    description: "Shaping and maintaining your beard.",
    price: 20,
    duration: 15,
    category: "Facial Hair",
    image: "https://images.pexels.com/photos/1319461/pexels-photo-1319461.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "s3",
    name: "Full Shave",
    description: "Traditional straight razor shave with hot towel.",
    price: 30,
    duration: 30,
    category: "Facial Hair",
    image: "https://images.pexels.com/photos/1570806/pexels-photo-1570806.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "s4",
    name: "Haircut & Beard Combo",
    description: "Haircut with beard trim or shave.",
    price: 50,
    duration: 45,
    category: "Combos",
    image: "https://images.pexels.com/photos/897262/pexels-photo-897262.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "s5",
    name: "Premium Haircut",
    description: "Haircut, wash, and styling with premium products.",
    price: 45,
    duration: 45,
    category: "Haircuts",
    image: "https://images.pexels.com/photos/1805600/pexels-photo-1805600.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "s6",
    name: "Kid's Haircut",
    description: "Haircut for children under 12.",
    price: 25,
    duration: 20,
    category: "Haircuts",
    image: "https://images.pexels.com/photos/1205033/pexels-photo-1205033.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "s7",
    name: "Head Shave",
    description: "Complete head shave with razor.",
    price: 30,
    duration: 30,
    category: "Haircuts",
    image: "https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    id: "s8",
    name: "Hair Coloring",
    description: "Professional hair coloring service.",
    price: 70,
    duration: 90,
    category: "Color Services",
    image: "https://images.pexels.com/photos/3993339/pexels-photo-3993339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }
];