import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Scissors, Users } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Scissors className="h-6 w-6" />
            <span className="text-xl font-bold">BarberShop</span>
          </div>
          <nav className="hidden md:flex space-x-4">
            <Link href="/" className="font-medium">
              Home
            </Link>
            <Link href="/services" className="font-medium">
              Services
            </Link>
            <Link href="/about" className="font-medium">
              About
            </Link>
            <Link href="/contact" className="font-medium">
              Contact
            </Link>
          </nav>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link href="/book">Book Appointment</Link>
            </Button>
            <Button asChild>
              <Link href="/admin">Admin</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-12 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Professional Barber Services</h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Experience the finest haircuts and grooming services from our expert barbers.
            </p>
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/book">Book Now</Link>
            </Button>
          </div>
        </section>

        <section className="py-16 container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Haircut</h3>
              <p className="text-gray-600 mb-4">Professional haircut tailored to your style and preferences.</p>
              <p className="font-bold text-lg">$25</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Beard Trim</h3>
              <p className="text-gray-600 mb-4">Expert beard trimming and shaping for a clean, polished look.</p>
              <p className="font-bold text-lg">$15</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Full Service</h3>
              <p className="text-gray-600 mb-4">Complete haircut and beard trim package with premium care.</p>
              <p className="font-bold text-lg">$35</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Expert Barbers</h3>
                <p className="text-gray-600">Our team consists of skilled professionals with years of experience.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <CalendarDays className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
                <p className="text-gray-600">Book your appointment online in just a few clicks.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Clock className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold mb-2">Timely Service</h3>
                <p className="text-gray-600">We value your time and ensure prompt, efficient service.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">BarberShop</h3>
              <p className="text-gray-400">Professional barber services for the modern gentleman.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Hours</h3>
              <p className="text-gray-400">Monday - Friday: 9am - 7pm</p>
              <p className="text-gray-400">Saturday: 10am - 6pm</p>
              <p className="text-gray-400">Sunday: Closed</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Contact</h3>
              <p className="text-gray-400">123 Main Street</p>
              <p className="text-gray-400">New York, NY 10001</p>
              <p className="text-gray-400">info@barbershop.com</p>
              <p className="text-gray-400">(123) 456-7890</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/book" className="text-gray-400 hover:text-white">
                    Book Appointment
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="text-gray-400 hover:text-white">
                    Services
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-400 hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2023 BarberShop. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
