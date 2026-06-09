# CRM Setup Application

A modern, customizable CRM setup application built with Next.js, TypeScript, and Tailwind CSS. This application provides a comprehensive setup wizard for configuring your CRM system with customizable dashboards, disposition categories, and navigation settings.

## 🚀 Features

### Setup Wizard
- **6-Step Setup Process**: Complete configuration wizard for CRM setup
- **Step Navigation**: Easy navigation between setup steps with progress tracking
- **Data Persistence**: All configuration data is saved in global state

### Dashboard Configuration
- **KPI Metrics**: Create and manage custom KPI widgets
- **Call Disposition**: Configure disposition categories with dynamic charts
- **Chart Types**: Support for 8 different chart types (Bar, Line, Pie, Doughnut, Polar Area, Radar, Scatter, Bubble)
- **Empty States**: Beautiful empty states with illustrations when no data is configured

### Navigation & Theme
- **Menu Styles**: Choose between Layout and Compact navigation styles
- **Theme Colors**: Customizable primary and secondary colors
- **Logo Upload**: Upload and configure company logo
- **Color Picker**: Advanced color picker with hex input and visual selection

### User Interface
- **Custom Components**: Reusable UI components (Input, Dropdown, Button, ColorPicker, etc.)
- **Responsive Design**: Mobile-first responsive design
- **Modern UI**: Clean, professional interface with consistent styling
- **Empty States**: User-friendly empty states with helpful illustrations

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React Chart.js 2
- **State Management**: React Context API
- **Icons**: Custom icon components
- **UI Components**: Custom-built component library

## 📁 Project Structure

```
outcess/
├── app/
│   ├── setup/                    # Setup wizard pages
│   │   ├── page.tsx             # Main setup page
│   │   ├── setup-page/          # Step 1: Basic Setup
│   │   ├── header-navigation/   # Step 2: Header & Navigation
│   │   ├── dashboard/           # Step 3: Dashboard Configuration
│   │   ├── customer-book/       # Step 4: Customer Book
│   │   ├── user-management/     # Step 5: User Management
│   │   └── review-configuration/ # Step 6: Review & Submit
│   ├── globals.css              # Global styles and component styles
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Dropdown.tsx
│   │   ├── ColorPicker.tsx
│   │   ├── Radio.tsx
│   │   └── Icon.tsx
│   ├── CallDisposition.tsx      # Disposition management component
│   ├── KPIMetric.tsx           # KPI metrics management component
│   └── setupIcon/              # Setup step icons
├── contexts/
│   └── SetupContext.tsx        # Global state management
├── lib/
│   └── colors.ts               # Color palette definitions
└── public/
    └── illustrations/          # Empty state illustrations
```

## 🎨 Key Components

### SetupContext
Central state management for the entire setup process:
- Company information
- Navigation settings (menu style, theme colors, logo)
- Dashboard settings (widgets, dispositions, call outcomes)
- Step navigation and validation

### CallDisposition Component
- Manage disposition categories
- Dynamic chart rendering based on selected chart type
- Add/Edit/Delete disposition categories
- Empty state with Pie Chart illustration

### KPIMetric Component
- Create and manage KPI widgets
- Call outcomes management with empty state
- Widget configuration with color picker
- Empty state with Call Block illustration

### Custom UI Components
- **ColorPicker**: Advanced color selection with hex input
- **Dropdown**: Custom dropdown with empty state support
- **Input**: Consistent input styling with validation
- **Button**: Multiple variants and sizes

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CRM
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📋 Setup Process

### Step 1: Basic Setup
- Company name
- Time zone selection
- Industry selection
- Business size

### Step 2: Header & Navigation
- Menu style (Layout/Compact)
- Theme colors (Primary/Secondary)
- Logo upload

### Step 3: Dashboard Configuration
- Dashboard name and visibility
- KPI metrics setup
- Call disposition categories
- Chart type selection

### Step 4: Customer Book
- Customer data configuration
- Field customization

### Step 5: User Management
- User roles and permissions
- Access control setup

### Step 6: Review Configuration
- Review all settings
- Submit for approval

## 🎯 Key Features Explained

### Dynamic Chart Rendering
The application supports 8 different chart types that can be selected dynamically:
- Bar Chart
- Line Chart  
- Pie Chart
- Doughnut Chart
- Polar Area Chart
- Radar Chart
- Scatter Chart
- Bubble Chart

### Empty States
Beautiful empty states with illustrations:
- Call Outcomes: Call-Block illustration
- Chart Area: Pie-Chart illustration
- Dropdown: Custom empty state with icon

### State Management
All setup data is managed through React Context:
- Persistent across navigation
- Real-time updates
- Type-safe with TypeScript

## 🎨 Customization

### Colors
The application uses a comprehensive color system defined in `lib/colors.ts`:
- Primary colors
- Secondary colors
- Accent colors
- Status colors (success, error, warning)

### Components
All UI components are custom-built and can be easily customized:
- Consistent styling with Tailwind CSS
- TypeScript interfaces for type safety
- Reusable across the application

## 📱 Responsive Design

The application is fully responsive with:
- Mobile-first approach
- Breakpoint-specific layouts
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🔧 Development

### Adding New Setup Steps
1. Create new page in `app/setup/`
2. Add step to `SetupContext.tsx`
3. Update navigation in `layout.tsx`

### Adding New Chart Types
1. Import chart component from Chart.js
2. Register in `CallDisposition.tsx`
3. Add to `chartTypeOptions` array
4. Update type definitions

### Customizing Components
All components are modular and can be customized:
- Modify styles in component files
- Update TypeScript interfaces
- Add new props as needed

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support or questions, please contact the development team.

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
