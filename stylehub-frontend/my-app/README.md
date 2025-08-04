# E-commerce Frontend

Frontend React application for an e-commerce platform.

## Features

- User authentication (login/register)
- Product browsing and search
- Shopping cart functionality
- Order management
- User profile management
- Admin panel for managing products, orders, and users
- Responsive design

## Technologies Used

- React 18
- React Router DOM
- Axios for API calls
- Context API for state management
- CSS3 for styling

## Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ecommerce-frontend
```

2. Install dependencies
```bash
npm install
```

3. Create environment file
```bash
cp .env.example .env
```

4. Update the `.env` file with your backend API URL:
```
REACT_APP_API_URL=http://localhost:5000
```

5. Start the development server
```bash
npm start
```

The application will open at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── common/         # Common components (Header, Footer, etc.)
│   ├── auth/           # Authentication components
│   ├── products/       # Product-related components
│   ├── cart/           # Cart components
│   ├── orders/         # Order components
│   └── users/          # User components
├── pages/              # Page components
├── services/           # API services
├── context/            # React Context providers
├── hooks/              # Custom hooks
├── utils/              # Utility functions
└── styles/             # CSS files
```

