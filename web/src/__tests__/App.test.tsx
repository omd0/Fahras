import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import App from '../App';

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  </BrowserRouter>
);

test('renders Fahras application', () => {
  render(
    <TestWrapper>
      <App />
    </TestWrapper>
  );
  
  // Since the app redirects to /dashboard by default, we should see the dashboard
  expect(screen.getByText(/Fahras/i)).toBeInTheDocument();
});
