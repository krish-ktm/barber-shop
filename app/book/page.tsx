"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Scissors, Check } from "lucide-react"

// Dummy data
const services = [
  {
    id: 1,
    name: "Haircut",
    price: 25,
    duration: 30,
    description: "Professional haircut tailored to your style and preferences.",
  },
  {
    id: 2,
    name: "Beard Trim",
    price: 15,
    duration: 15,
    description: "Expert beard trimming and shaping for a clean, polished look.",
  },
  {
    id: 3,
    name: "Full Service",
    price: 35,
    duration: 45,
    description: "Complete haircut and beard trim package with premium care.",
  },
  {
    id: 4,
    name: "Hair Coloring",
    price: 50,
    duration: 60,
    description: "Professional hair coloring service with quality products.",
  },
  {
    id: 5,
    name: "Hot Towel Shave",
    price: 30,
    duration: 30,
    description: "Relaxing hot towel shave for a smooth, refreshed feel.",
  },
]

const barbers = [
  { id: 1, name: "John Smith", specialties: [1, 2, 3, 5], image: "/placeholder.svg?height=100&width=100" },
  { id: 2, name: "Mike Johnson", specialties: [1, 2, 3, 4], image: "/placeholder.svg?height=100&width=100" },
  { id: 3, name: "David Williams", specialties: [1, 3, 4, 5], image: "/placeholder.svg?height=100&width=100" },
  { id: 4, name: "Robert Brown", specialties: [1, 2, 3, 4, 5], image: "/placeholder.svg?height=100&width=100" },
]

const timeSlots = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
]

export default function BookingPage() {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState<number | null>(null)
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [bookingComplete, setBookingComplete] = useState(false)

  const handleNextStep = () => {
    if (step < 5) {
      setStep(step + 1)
    } else {
      // Submit booking
      setBookingComplete(true)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select a Service</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map((service) => (
                <Card
                  key={service.id}
                  className={`cursor-pointer transition-all ${selectedService === service.id ? "ring-2 ring-black" : ""}`}
                  onClick={() => setSelectedService(service.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{service.name}</h3>
                        <p className="text-gray-500 text-sm">{service.duration} min</p>
                        <p className="mt-2">{service.description}</p>
                      </div>
                      <div className="text-lg font-bold">${service.price}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select a Barber</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barbers
                .filter((barber) => (selectedService ? barber.specialties.includes(selectedService) : true))
                .map((barber) => (
                  <Card
                    key={barber.id}
                    className={`cursor-pointer transition-all ${selectedBarber === barber.id ? "ring-2 ring-black" : ""}`}
                    onClick={() => setSelectedBarber(barber.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                          <img
                            src={barber.image || "/placeholder.svg"}
                            alt={barber.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{barber.name}</h3>
                          <p className="text-gray-500 text-sm">
                            Specialties:{" "}
                            {barber.specialties.map((id) => services.find((s) => s.id === id)?.name).join(", ")}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select a Date</h2>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={
                  (date) => date < new Date() || date.getDay() === 0 // Sundays disabled
                }
              />
            </div>
          </div>
        )
      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Select a Time</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="h-12"
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )
      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" placeholder="Enter your last name" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="Enter your phone number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Special Requests (Optional)</Label>
                <Textarea id="notes" placeholder="Any special requests or notes for your barber" />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">
              Your appointment has been successfully booked. We've sent a confirmation to your email.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Service:</div>
                <div className="font-medium">{services.find((s) => s.id === selectedService)?.name}</div>

                <div className="text-gray-500">Barber:</div>
                <div className="font-medium">{barbers.find((b) => b.id === selectedBarber)?.name}</div>

                <div className="text-gray-500">Date:</div>
                <div className="font-medium">{selectedDate?.toLocaleDateString()}</div>

                <div className="text-gray-500">Time:</div>
                <div className="font-medium">{selectedTime}</div>

                <div className="text-gray-500">Booking ID:</div>
                <div className="font-medium">BK-{Math.floor(100000 + Math.random() * 900000)}</div>
              </div>
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/book">Book Another Appointment</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <Scissors className="h-6 w-6" />
            <span className="text-xl font-bold">BarberShop</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-6">Book Your Appointment</h1>

            <div className="relative mb-8">
              <div className="flex items-center justify-between w-full mb-2">
                {[1, 2, 3, 4, 5].map((stepNumber) => (
                  <div
                    key={stepNumber}
                    className={`flex flex-col items-center ${stepNumber <= step ? "text-black" : "text-gray-400"}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        stepNumber < step
                          ? "bg-black text-white"
                          : stepNumber === step
                            ? "bg-white border-2 border-black text-black"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {stepNumber < step ? <Check className="h-5 w-5" /> : stepNumber}
                    </div>
                    <span className="text-xs hidden md:block">
                      {stepNumber === 1 && "Service"}
                      {stepNumber === 2 && "Barber"}
                      {stepNumber === 3 && "Date"}
                      {stepNumber === 4 && "Time"}
                      {stepNumber === 5 && "Details"}
                    </span>
                  </div>
                ))}
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10"></div>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                {getStepContent()}

                <div className="flex justify-between mt-8">
                  <Button variant="outline" onClick={handlePrevStep} disabled={step === 1}>
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>

                  <Button
                    onClick={handleNextStep}
                    disabled={
                      (step === 1 && !selectedService) ||
                      (step === 2 && !selectedBarber) ||
                      (step === 3 && !selectedDate) ||
                      (step === 4 && !selectedTime)
                    }
                  >
                    {step === 5 ? "Confirm Booking" : "Next"} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
