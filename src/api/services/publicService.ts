import { get, post } from '../apiClient';
import { Service } from './serviceService';
import { Staff } from './staffService';

// Type definitions
export interface BusinessInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  logo?: string;
  business_hours: {
    day_of_week: string;
    open_time: string;
    close_time: string;
  }[];
}

export interface GalleryImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  category?: string;
}

export interface PublicService extends Omit<Service, 'created_at' | 'updated_at'> {}

export interface PublicStaff {
  id: string;
  name: string;
  position: string;
  bio?: string;
  image?: string;
  services: string[];
}

export interface Review {
  id: string;
  customer_name: string;
  staff_name: string;
  rating: number;
  text?: string;
  date: string;
}

export interface ContactForm {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export interface BookingRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_id: string;
  staff_id: string;
  date: string;
  time: string;
  notes?: string;
}

// Response interfaces
interface BusinessResponse {
  success: boolean;
  business: BusinessInfo;
}

interface GalleryResponse {
  success: boolean;
  images: GalleryImage[];
}

interface ServicesResponse {
  success: boolean;
  services: Record<string, PublicService[]>;
}

interface StaffResponse {
  success: boolean;
  staff: PublicStaff[];
}

interface ReviewsResponse {
  success: boolean;
  reviews: Review[];
}

interface ContactResponse {
  success: boolean;
  message: string;
}

interface BookingResponse {
  success: boolean;
  appointment: any; // Using any since we don't need the full type for public API
}

/**
 * Get public business information
 */
export const getBusinessInfo = async (): Promise<BusinessResponse> => {
  return get<BusinessResponse>('/public/business');
};

/**
 * Get gallery images
 */
export const getGalleryImages = async (): Promise<GalleryResponse> => {
  return get<GalleryResponse>('/public/gallery');
};

/**
 * Get public services
 */
export const getPublicServices = async (category?: string): Promise<ServicesResponse> => {
  let url = '/public/services';
  
  if (category) {
    url += `?category=${category}`;
  }
  
  return get<ServicesResponse>(url);
};

/**
 * Get public staff information
 */
export const getPublicStaff = async (): Promise<StaffResponse> => {
  return get<StaffResponse>('/public/staff');
};

/**
 * Get public reviews
 */
export const getPublicReviews = async (): Promise<ReviewsResponse> => {
  return get<ReviewsResponse>('/public/reviews');
};

/**
 * Submit contact form
 */
export const submitContactForm = async (formData: ContactForm): Promise<ContactResponse> => {
  return post<ContactResponse>('/public/contact', formData);
};

/**
 * Create public booking
 */
export const createPublicBooking = async (bookingData: BookingRequest): Promise<BookingResponse> => {
  return post<BookingResponse>('/public/booking', bookingData);
}; 