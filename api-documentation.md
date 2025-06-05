# Barber Shop Management System - API Documentation

## Overview

This document outlines the API server implementation required to support the Barber Shop Management System. The API will replace the current mock data with real functionality, enabling persistent data storage and business logic implementation.

## Technology Stack Recommendations

### Backend Framework
- **Node.js with Express.js**
  - Fast, lightweight, and excellent for JSON APIs
  - Large ecosystem of middleware

### Database Options

#### Recommended: MongoDB
- **Pros**:
  - Flexible schema that matches our data models
  - JSON-based document storage aligns with frontend models
  - Excellent for rapid development and iterations
  - Scalable for future growth
  - Strong support for geospatial queries (for future location-based features)
- **Cons**:
  - Less robust for complex transactions
  - May require careful index planning

#### Alternative: PostgreSQL
- **Pros**:
  - ACID compliance for reliable transactions
  - Strong data integrity with foreign keys
  - Advanced reporting capabilities
  - JSON support for flexible data
- **Cons**:
  - More rigid schema changes
  - Higher setup complexity

### Authentication
- **JWT (JSON Web Tokens)**
  - Stateless authentication
  - Role-based access control for admin, staff, and billing users

## Data Models

Based on the existing frontend implementation, the following data models are required:

### User
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "password": "string (hashed)",
  "phone": "string",
  "role": "enum (admin, staff, billing)",
  "image": "string (URL)",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Staff
```json
{
  "id": "string",
  "userId": "string (reference to User)",
  "position": "string",
  "bio": "string",
  "services": ["string (service IDs)"],
  "workingHours": {
    "monday": [{"start": "string", "end": "string", "isBreak": "boolean"}],
    "tuesday": [...],
    "wednesday": [...],
    "thursday": [...],
    "friday": [...],
    "saturday": [...],
    "sunday": [...]
  },
  "commissionPercentage": "number",
  "isAvailable": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Service
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": "number",
  "duration": "number (minutes)",
  "category": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Appointment
```json
{
  "id": "string",
  "customerId": "string",
  "staffId": "string",
  "date": "string (YYYY-MM-DD)",
  "time": "string (HH:MM)",
  "endTime": "string (HH:MM)",
  "services": [
    {
      "serviceId": "string",
      "serviceName": "string",
      "price": "number",
      "duration": "number"
    }
  ],
  "status": "enum (scheduled, confirmed, completed, cancelled, no-show)",
  "totalAmount": "number",
  "notes": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Customer
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "phone": "string",
  "visitCount": "number",
  "totalSpent": "number",
  "lastVisit": "date",
  "notes": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Invoice
```json
{
  "id": "string",
  "appointmentId": "string",
  "customerId": "string",
  "staffId": "string",
  "date": "string (YYYY-MM-DD)",
  "services": [
    {
      "serviceId": "string",
      "serviceName": "string",
      "price": "number",
      "quantity": "number",
      "total": "number"
    }
  ],
  "subtotal": "number",
  "discountType": "enum (percentage, fixed)",
  "discountValue": "number",
  "discountAmount": "number",
  "tipAmount": "number",
  "tax": "number",
  "taxAmount": "number",
  "taxComponents": [
    {
      "name": "string",
      "rate": "number",
      "amount": "number"
    }
  ],
  "total": "number",
  "paymentMethod": "enum (cash, card, mobile, pending)",
  "status": "enum (paid, pending, cancelled)",
  "notes": "string",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### BusinessSettings
```json
{
  "name": "string",
  "address": "string",
  "phone": "string",
  "email": "string",
  "logo": "string",
  "workingHours": {
    "monday": {"open": "string", "close": "string"},
    "tuesday": {"open": "string", "close": "string"},
    "wednesday": {"open": "string", "close": "string"},
    "thursday": {"open": "string", "close": "string"},
    "friday": {"open": "string", "close": "string"},
    "saturday": {"open": "string", "close": "string"},
    "sunday": {"open": "string", "close": "string"}
  },
  "slotDuration": "number",
  "taxRate": "number",
  "allowDiscounts": "boolean",
  "allowTips": "boolean",
  "defaultCommission": "number",
  "updatedAt": "date"
}
```

### GSTRate
```json
{
  "id": "string",
  "name": "string",
  "components": [
    {
      "id": "string",
      "name": "string",
      "rate": "number"
    }
  ],
  "isActive": "boolean",
  "totalRate": "number",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Log
```json
{
  "id": "string",
  "userId": "string",
  "userName": "string",
  "userRole": "string",
  "action": "string",
  "details": "string",
  "timestamp": "date"
}
```

### Review
```json
{
  "id": "string",
  "customerId": "string",
  "customerName": "string",
  "staffId": "string",
  "rating": "number",
  "text": "string",
  "date": "date",
  "isApproved": "boolean",
  "createdAt": "date",
  "updatedAt": "date"
}
```

## API Endpoints

### Authentication

#### POST /api/auth/login
- **Description**: Authenticates user and returns token
- **Request Body**: `{ "email": string, "password": string }`
- **Response**: `{ "token": string, "user": User }`
- **Status Codes**: 200 OK, 401 Unauthorized

#### POST /api/auth/register
- **Description**: Creates a new user account
- **Request Body**: `{ "name": string, "email": string, "password": string, "phone": string, "role": string }`
- **Response**: `{ "token": string, "user": User }`
- **Status Codes**: 201 Created, 400 Bad Request

#### GET /api/auth/me
- **Description**: Returns current user profile
- **Headers**: Authorization: Bearer [token]
- **Response**: `{ "user": User }`
- **Status Codes**: 200 OK, 401 Unauthorized

### Staff Management

#### GET /api/staff
- **Description**: Retrieves all staff members
- **Query Parameters**: `sort`, `limit`, `page`
- **Response**: `{ "staff": Staff[], "totalCount": number, "pages": number }`
- **Status Codes**: 200 OK, 401 Unauthorized

#### GET /api/staff/:id
- **Description**: Retrieves a specific staff member
- **Response**: `{ "staff": Staff }`
- **Status Codes**: 200 OK, 404 Not Found

#### POST /api/staff
- **Description**: Creates a new staff member
- **Request Body**: Staff object
- **Response**: `{ "staff": Staff }`
- **Status Codes**: 201 Created, 400 Bad Request

#### PUT /api/staff/:id
- **Description**: Updates a staff member
- **Request Body**: Staff object
- **Response**: `{ "staff": Staff }`
- **Status Codes**: 200 OK, 404 Not Found

#### DELETE /api/staff/:id
- **Description**: Deletes a staff member
- **Response**: `{ "success": boolean }`
- **Status Codes**: 200 OK, 404 Not Found

#### PUT /api/staff/:id/availability
- **Description**: Updates staff working hours
- **Request Body**: `{ "workingHours": WorkingHours }`
- **Response**: `{ "success": boolean }`
- **Status Codes**: 200 OK, 404 Not Found

### Services

#### GET /api/services
- **Description**: Retrieves all services
- **Query Parameters**: `category`, `sort`, `limit`, `page`
- **Response**: `{ "services": Service[], "totalCount": number, "pages": number }`
- **Status Codes**: 200 OK

#### GET /api/services/:id
- **Description**: Retrieves a specific service
- **Response**: `{ "service": Service }`
- **Status Codes**: 200 OK, 404 Not Found

#### POST /api/services
- **Description**: Creates a new service
- **Request Body**: Service object
- **Response**: `{ "service": Service }`
- **Status Codes**: 201 Created, 400 Bad Request

#### PUT /api/services/:id
- **Description**: Updates a service
- **Request Body**: Service object
- **Response**: `{ "service": Service }`
- **Status Codes**: 200 OK, 404 Not Found

#### DELETE /api/services/:id
- **Description**: Deletes a service
- **Response**: `{ "success": boolean }`
- **Status Codes**: 200 OK, 404 Not Found

### Appointments

#### GET /api/appointments
- **Description**: Retrieves all appointments
- **Query Parameters**: `date`, `staffId`, `customerId`, `status`, `sort`, `limit`, `page`
- **Response**: `{ "appointments": Appointment[], "totalCount": number, "pages": number }`
- **Status Codes**: 200 OK

#### GET /api/appointments/:id
- **Description**: Retrieves a specific appointment
- **Response**: `{ "appointment": Appointment }`
- **Status Codes**: 200 OK, 404 Not Found

#### POST /api/appointments
- **Description**: Creates a new appointment
- **Request Body**: Appointment object
- **Response**: `{ "appointment": Appointment }`
- **Status Codes**: 201 Created, 400 Bad Request

#### PUT /api/appointments/:id
- **Description**: Updates an appointment
- **Request Body**: Appointment object
- **Response**: `{ "appointment": Appointment }`
- **Status Codes**: 200 OK, 404 Not Found

#### DELETE /api/appointments/:id
- **Description**: Cancels an appointment
- **Response**: `{ "success": boolean }`
- **Status Codes**: 200 OK, 404 Not Found

#### GET /api/appointments/available-slots
- **Description**: Retrieves available time slots for booking
- **Query Parameters**: `date`, `staffId`, `serviceId`
- **Response**: `{ "slots": [{ "time": string, "available": boolean }] }`
- **Status Codes**: 200 OK

#### POST /api/appointments/:id/reschedule
- **Description**: Reschedules an existing appointment
- **Request Body**: `{ "date": string, "time": string }`
- **Response**: `{ "appointment": Appointment }`
- **Status Codes**: 200 OK, 404 Not Found

### Customers

#### GET /api/customers
- **Description**: Retrieves all customers
- **Query Parameters**: `search`, `sort`, `limit`, `page`
- **Response**: `{ "customers": Customer[], "totalCount": number, "pages": number }`
- **Status Codes**: 200 OK

#### GET /api/customers/:id
- **Description**: Retrieves a specific customer
- **Response**: `{ "customer": Customer }`
- **Status Codes**: 200 OK, 404 Not Found

#### POST /api/customers
- **Description**: Creates a new customer
- **Request Body**: Customer object
- **Response**: `{ "customer": Customer }`
- **Status Codes**: 201 Created, 400 Bad Request

#### PUT /api/customers/:id
- **Description**: Updates a customer
- **Request Body**: Customer object
- **Response**: `{ "customer": Customer }`
- **Status Codes**: 200 OK, 404 Not Found

#### GET /api/customers/:id/appointments
- **Description**: Retrieves customer's appointment history
- **Response**: `{ "appointments": Appointment[] }`
- **Status Codes**: 200 OK, 404 Not Found

#### GET /api/customers/:id/invoices
- **Description**: Retrieves customer's invoice history
- **Response**: `{ "invoices": Invoice[] }`
- **Status Codes**: 200 OK, 404 Not Found

### Invoices & POS

#### GET /api/invoices
- **Description**: Retrieves all invoices
- **Query Parameters**: `dateFrom`, `dateTo`, `staffId`, `customerId`, `status`, `sort`, `limit`, `page`
- **Response**: `{ "invoices": Invoice[], "totalCount": number, "pages": number }`
- **Status Codes**: 200 OK

#### GET /api/invoices/:id
- **Description**: Retrieves a specific invoice
- **Response**: `{ "invoice": Invoice }`
- **Status Codes**: 200 OK, 404 Not Found

#### POST /api/invoices
- **Description**: Creates a new invoice
- **Request Body**: Invoice object
- **Response**: `{ "invoice": Invoice }`
- **Status Codes**: 201 Created, 400 Bad Request

#### PUT /api/invoices/:id
- **Description**: Updates an invoice
- **Request Body**: Invoice object
- **Response**: `{ "invoice": Invoice }`
- **Status Codes**: 200 OK, 404 Not Found

#### POST /api/invoices/:id/send
- **Description**: Sends invoice to customer by email
- **Response**: `{ "success": boolean }`
- **Status Codes**: 200 OK, 404 Not Found

### Business Settings

#### GET /api/settings
- **Description**: Retrieves business settings
- **Response**: `{ "settings": BusinessSettings }`
- **Status Codes**: 200 OK

#### PUT /api/settings
- **Description**: Updates business settings
- **Request Body**: BusinessSettings object
- **Response**: `{ "settings": BusinessSettings }`
- **Status Codes**: 200 OK, 400 Bad Request

#### GET /api/settings/gst-rates
- **Description**: Retrieves GST rates configuration
- **Response**: `{ "gstRates": GSTRate[] }`
- **Status Codes**: 200 OK

#### PUT /api/settings/gst-rates
- **Description**: Updates GST rates configuration
- **Request Body**: `{ "gstRates": GSTRate[] }`
- **Response**: `{ "gstRates": GSTRate[] }`
- **Status Codes**: 200 OK, 400 Bad Request

### Reports & Analytics

#### GET /api/reports/dashboard
- **Description**: Retrieves dashboard statistics
- **Query Parameters**: `period` (daily, weekly, monthly)
- **Response**: Dashboard statistics object
- **Status Codes**: 200 OK

#### GET /api/reports/revenue
- **Description**: Retrieves revenue data for reports
- **Query Parameters**: `dateFrom`, `dateTo`, `groupBy` (day, week, month)
- **Response**: `{ "data": [{ "date": string, "revenue": number }] }`
- **Status Codes**: 200 OK

#### GET /api/reports/services
- **Description**: Retrieves service performance data
- **Query Parameters**: `dateFrom`, `dateTo`, `sort`
- **Response**: `{ "data": [{ "serviceId": string, "name": string, "bookings": number, "revenue": number }] }`
- **Status Codes**: 200 OK

#### GET /api/reports/staff
- **Description**: Retrieves staff performance data
- **Query Parameters**: `dateFrom`, `dateTo`, `sort`
- **Response**: `{ "data": [{ "staffId": string, "name": string, "appointments": number, "revenue": number, "commission": number }] }`
- **Status Codes**: 200 OK

### Reviews

#### GET /api/reviews
- **Description**: Retrieves all reviews
- **Query Parameters**: `approved`, `staffId`, `sort`, `limit`, `page`
- **Response**: `{ "reviews": Review[], "totalCount": number, "pages": number }`
- **Status Codes**: 200 OK

#### GET /api/reviews/:id
- **Description**: Retrieves a specific review
- **Response**: `{ "review": Review }`
- **Status Codes**: 200 OK, 404 Not Found

#### POST /api/reviews
- **Description**: Creates a new review
- **Request Body**: Review object
- **Response**: `{ "review": Review }`
- **Status Codes**: 201 Created, 400 Bad Request

#### PUT /api/reviews/:id/approve
- **Description**: Approves a review for public display
- **Response**: `{ "success": boolean }`
- **Status Codes**: 200 OK, 404 Not Found

#### DELETE /api/reviews/:id
- **Description**: Deletes a review
- **Response**: `{ "success": boolean }`
- **Status Codes**: 200 OK, 404 Not Found

### Activity Logs

#### GET /api/logs
- **Description**: Retrieves activity logs
- **Query Parameters**: `userId`, `action`, `dateFrom`, `dateTo`, `limit`, `page`
- **Response**: `{ "logs": Log[], "totalCount": number, "pages": number }`
- **Status Codes**: 200 OK

### Public Website API

#### GET /api/public/business
- **Description**: Retrieves public business information
- **Response**: Business information object
- **Status Codes**: 200 OK

#### GET /api/public/services
- **Description**: Retrieves services for public display
- **Query Parameters**: `category`
- **Response**: `{ "services": Service[] }`
- **Status Codes**: 200 OK

#### GET /api/public/staff
- **Description**: Retrieves staff for public display
- **Response**: `{ "staff": Staff[] }`
- **Status Codes**: 200 OK

#### GET /api/public/reviews
- **Description**: Retrieves approved reviews for public display
- **Response**: `{ "reviews": Review[] }`
- **Status Codes**: 200 OK

#### POST /api/public/contact
- **Description**: Submits contact form
- **Request Body**: `{ "name": string, "email": string, "phone": string, "message": string }`
- **Response**: `{ "success": boolean }`
- **Status Codes**: 200 OK, 400 Bad Request

#### POST /api/public/booking
- **Description**: Creates a booking from public website
- **Request Body**: Booking information
- **Response**: `{ "appointment": Appointment }`
- **Status Codes**: 201 Created, 400 Bad Request

## Implementation Recommendations

### API Security
1. **HTTPS** for all connections
2. **JWT Authentication** with role-based permissions
3. **Input Validation** to prevent injection attacks
4. **Rate Limiting** to prevent abuse
5. **CORS Configuration** for frontend access

### Performance Optimization
1. **Database Indexing** for frequently queried fields
2. **Caching** for static data like services and business settings
3. **Pagination** for large data sets
4. **Query Optimization** for complex reports

### Additional Features
1. **Email Service Integration** for appointment confirmations and invoices
2. **SMS Notifications** for appointment reminders
3. **Payment Gateway Integration** for online bookings
4. **Image Upload Service** for staff photos and gallery

## Implementation Phases

### Phase 1: Core API
- Authentication and user management
- Basic CRUD operations for all entities
- Business settings

### Phase 2: Booking Logic
- Appointment scheduling with conflict detection
- Availability calculation
- Staff management with working hours

### Phase 3: Financial Features
- Invoice generation and management
- GST/tax calculation
- Reports and analytics

### Phase 4: Advanced Features
- Email and SMS notifications
- Public website API
- Reviews and ratings
- Activity logging

## Conclusion

This API documentation provides a comprehensive roadmap for implementing the backend services required by the Barber Shop Management System. MongoDB is recommended as the primary database due to its flexibility and alignment with the existing data models, though PostgreSQL is a viable alternative for scenarios requiring more complex transactions.

The implementation should follow REST principles with proper authentication, authorization, and error handling to ensure a secure and robust system. 