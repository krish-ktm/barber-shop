export interface Barber {
  id: string;
  name: string;
  title: string;
  image: string;
  bio: string;
  experience: number; // in years
  rating: number;
  specialties: string[];
  workingDays: string[];
  workHours: {
    start: string;
    end: string;
  };
  commission: number; // percentage
  active: boolean;
}

export const barbers: Barber[] = [
  {
    id: "b1",
    name: "James Wilson",
    title: "Master Barber",
    image: "https://images.pexels.com/photos/1547531/pexels-photo-1547531.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    bio: "With over 10 years of experience, James specializes in classic cuts and precision fades.",
    experience: 10,
    rating: 4.9,
    specialties: ["Classic Cuts", "Fades", "Beard Styling"],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    workHours: {
      start: "09:00",
      end: "17:00"
    },
    commission: 60,
    active: true
  },
  {
    id: "b2",
    name: "Michael Rodriguez",
    title: "Senior Barber",
    image: "https://images.pexels.com/photos/5325880/pexels-photo-5325880.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    bio: "Michael blends traditional techniques with modern styles for the perfect look.",
    experience: 7,
    rating: 4.7,
    specialties: ["Modern Styles", "Skin Fades", "Hair Design"],
    workingDays: ["Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    workHours: {
      start: "10:00",
      end: "18:00"
    },
    commission: 55,
    active: true
  },
  {
    id: "b3",
    name: "Robert Johnson",
    title: "Barber & Stylist",
    image: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    bio: "Robert is known for his attention to detail and styling expertise.",
    experience: 5,
    rating: 4.8,
    specialties: ["Styling", "Coloring", "Texture Work"],
    workingDays: ["Monday", "Tuesday", "Saturday", "Sunday"],
    workHours: {
      start: "12:00",
      end: "20:00"
    },
    commission: 50,
    active: true
  },
  {
    id: "b4",
    name: "David Thompson",
    title: "Apprentice Barber",
    image: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    bio: "David is our newest team member with fresh ideas and techniques.",
    experience: 2,
    rating: 4.5,
    specialties: ["Basic Cuts", "Beard Trims"],
    workingDays: ["Tuesday", "Wednesday", "Thursday", "Friday", "Sunday"],
    workHours: {
      start: "09:00",
      end: "17:00"
    },
    commission: 40,
    active: true
  },
  {
    id: "b5",
    name: "John Adams",
    title: "Master Barber",
    image: "https://images.pexels.com/photos/1300907/pexels-photo-1300907.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    bio: "John is our shop veteran with decades of experience in all aspects of barbering.",
    experience: 15,
    rating: 5.0,
    specialties: ["Classic Cuts", "Straight Razor Shaves", "VIP Service"],
    workingDays: ["Monday", "Wednesday", "Friday"],
    workHours: {
      start: "08:00",
      end: "16:00"
    },
    commission: 65,
    active: true
  }
];