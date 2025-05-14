## 🧭 Admin Panel Navigation Structure

Based on the PRD, the Admin Panel should feature a clean, professional sidebar or header with **7 core navigation items**, representing each primary module. This structure ensures intuitive access and aligns with best UI/UX practices for admin dashboards.

---

### ✅ Primary Navigation Items

1. **Dashboard**
   - Overview of key metrics:
     - Daily, weekly, monthly revenue (mock data)
     - Appointment snapshots
     - Staff performance preview

2. **Appointments**
   - Calendar/schedule view
   - Manage bookings:
     - Upcoming
     - Cancelled
     - Rescheduled

3. **Staff Management**
   - Add/Edit/Delete barbers
   - Assign:
     - Services
     - Working hours / days off
     - Commission percentages

4. **Slot Configuration**
   - Define:
     - Opening & closing hours
     - Slot durations (15/30/60 min)
     - Breaks (lunch, tea)
     - Weekly availability

5. **Reports & Analytics**
   - Graphs using Recharts:
     - Sales trends
     - Top-performing staff
     - Customer behavior
     - Most booked services

6. **POS & Invoicing**
   - Create and view invoices
   - Add custom services, apply tips/discounts
   - Export or send (mock) email
   - View invoice history

7. **Settings**
   - Configure:
     - Tax percentage
     - Tip & discount toggles
     - Auto-send invoices
   - (Optional) Access control or theme preferences

---

### ➕ Optional Navigation Items

- **Activity Logs**
  - Simulated logs of admin/staff actions
  - e.g., “Ravi applied 10% discount to Invoice #1023”

- **Support / Help**
  - Link to help documentation or contact support

---

### 🖌️ UI Design Notes

- Use modern icon libraries:
  - [Lucide](https://lucide.dev) or [HeroIcons](https://heroicons.com)
- Sidebar should be:
  - Collapsible
  - Responsive across devices
  - Highlight active route (e.g., `bg-accent`, bold label)
- Support hover transitions and smooth animation
- Use consistent spacing and theming from `theme.ts`

