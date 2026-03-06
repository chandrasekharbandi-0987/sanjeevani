# Sanjeevani — Blood Donation & Healthcare Platform

## Project Overview
A full-featured mobile blood donation platform built with Expo React Native. Features role-based dashboards for Donors, Recipients, Doctors, and Admins. All data is persisted locally via AsyncStorage with no backend database required.

## Architecture

### Tech Stack
- **Frontend**: Expo (React Native + Web), expo-router (file-based routing)
- **Backend**: Express.js (TypeScript) — serves as API layer and static file host
- **State Management**: React Context (AuthContext, DataContext)
- **Persistence**: AsyncStorage (prefixed with `sanjeevani_`)
- **UI**: react-native StyleSheet, LinearGradient, expo-vector-icons, BlurView
- **Navigation**: NativeTabs (iOS 26 liquid glass) + classic Tabs fallback

### Color Palette
- Primary: `#C62828` (deep red)
- Secondary: `#FF6B6B` (coral)
- Accent: `#2EC4B6` (teal — used for Doctor role)
- Admin: `#7C3AED` (purple)
- Background: `#F7F9FB`

## Roles & Demo Accounts
| Role      | Email                   | Password     |
|-----------|-------------------------|--------------|
| Donor     | rahul@example.com       | donor123     |
| Recipient | meera@example.com       | recipient123 |
| Doctor    | doctor@example.com      | doctor123    |
| Admin     | admin@sanjeevani.com    | admin123     |

## File Structure

```
app/
  _layout.tsx               # Root layout with providers
  index.tsx                 # Landing page (hero, stats, features, CTA)
  login.tsx                 # Login with demo account shortcuts
  register.tsx              # Registration with role/blood group selection
  (donor)/
    _layout.tsx             # Donor tab layout (NativeTabs + classic fallback)
    index.tsx               # Donor dashboard (availability toggle, requests)
    history.tsx             # Donation history timeline
    chat.tsx                # Real-time chat with recipients
    profile.tsx             # Profile + notifications center
  (recipient)/
    _layout.tsx             # Recipient tab layout
    index.tsx               # Home (emergency request modal, donor search)
    search.tsx              # Donor search with filters
    requests.tsx            # Request tracking with progress steps
    chat.tsx                # Chat with donors
    profile.tsx             # Profile + notifications
  (doctor)/
    _layout.tsx             # Doctor tab layout (teal accent)
    index.tsx               # Dashboard with pending approvals
    approvals.tsx           # Full approval workflow management
    chat.tsx                # Patient/donor consultations
    profile.tsx             # Profile + notifications
  (admin)/
    _layout.tsx             # Admin tab layout (purple accent)
    index.tsx               # Dashboard (stats, recent users/requests)
    users.tsx               # User management with search & filters
    analytics.tsx           # Platform analytics with bar charts
    profile.tsx             # Profile + notifications

contexts/
  AuthContext.tsx           # Auth state, 8 seed users, role-based navigation
  DataContext.tsx           # All data: requests, donations, notifications, messages

components/
  shared.tsx                # BloodBadge, UrgencyBadge, StatusBadge, StatCard, SectionHeader, EmptyState, timeAgo
  ErrorBoundary.tsx         # App-level error boundary
```

## Key Features
- **Emergency Blood Requests**: Recipients create urgent requests with blood group, hospital, urgency level
- **Donor Search**: Filter by blood group, city, availability
- **Request Tracking**: Visual progress steps (pending → accepted → doctor approved → completed)
- **Medical Approval Workflow**: Doctors review accepted requests and approve/complete them
- **Real-time Chat**: Donor-recipient conversations with conversation list and threaded messages
- **Donation History**: Timeline of past donations for donors
- **Notification Center**: Per-user notification feed with unread counts
- **Admin Dashboard**: User management, platform analytics with bar charts

## Workflows
- **Start Backend**: `npm run server:dev` (port 5000)
- **Start Frontend**: `npm run expo:dev` (port 8081 for web/mobile)

## Deployment Notes
- Uses `getApiUrl()` from `@/lib/query-client` for all API calls
- Never hardcode domain URLs — use `process.env.EXPO_PUBLIC_DOMAIN`
- Web insets: 67px top, 34px bottom (or 84px tab bar height)
- Patches applied via `npm run postinstall` for Metro basePath support
