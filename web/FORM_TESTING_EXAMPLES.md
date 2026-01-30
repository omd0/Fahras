# Form Testing Examples - Practical Guide

## Quick Reference

### ❌ DON'T DO THIS
```typescript
// Direct DOM manipulation - doesn't trigger React state updates
const input = document.querySelector('input[name="email"]');
input.value = 'test@example.com';  // React state is NOT updated
```

### ✅ DO THIS INSTEAD
```typescript
import userEvent from '@testing-library/user-event';

const user = userEvent.setup();
const input = screen.getByLabelText(/Email/i);
await user.type(input, 'test@example.com');  // React state IS updated
```

---

## Complete Test Examples

### Example 1: Simple Form Submission

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';

test('submits form with valid credentials', async () => {
  const user = userEvent.setup();
  const mockLogin = jest.fn().mockResolvedValue(undefined);
  
  // Mock the auth store
  jest.mock('../../store', () => ({
    useAuthStore: () => ({
      login: mockLogin,
      isLoading: false,
      error: null,
    }),
  }));
  
  render(<LoginPage />);
  
  // Fill form fields
  await user.type(
    screen.getByLabelText(/Email/i),
    'test@example.com'
  );
  await user.type(
    screen.getByLabelText(/Password/i),
    'password123'
  );
  
  // Submit form
  await user.click(screen.getByRole('button', { name: /Sign In/i }));
  
  // Verify API was called
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### Example 2: Validation Error Testing

```typescript
test('shows validation errors for invalid email', async () => {
  const user = userEvent.setup();
  
  render(<LoginPage />);
  
  // Fill with invalid email
  await user.type(
    screen.getByLabelText(/Email/i),
    'invalid-email'
  );
  await user.type(
    screen.getByLabelText(/Password/i),
    'password123'
  );
  
  // Submit form
  await user.click(screen.getByRole('button', { name: /Sign In/i }));
  
  // Check for validation error
  await waitFor(() => {
    expect(screen.getByText('Email is invalid')).toBeInTheDocument();
  });
});
```

### Example 3: Error Clearing on Input

```typescript
test('clears error when user starts typing', async () => {
  const user = userEvent.setup();
  
  render(<LoginPage />);
  
  const emailInput = screen.getByLabelText(/Email/i);
  const submitButton = screen.getByRole('button', { name: /Sign In/i });
  
  // Trigger validation error
  await user.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });
  
  // Clear the error by typing
  await user.type(emailInput, 'test@example.com');
  
  // Error should disappear
  await waitFor(() => {
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });
});
```

### Example 4: Loading State Testing

```typescript
test('shows loading state during submission', async () => {
  const user = userEvent.setup();
  
  // Mock with loading state
  jest.mock('../../store', () => ({
    useAuthStore: () => ({
      login: jest.fn(() => new Promise(() => {})), // Never resolves
      isLoading: true,
      error: null,
    }),
  }));
  
  render(<LoginPage />);
  
  // Fill and submit
  await user.type(screen.getByLabelText(/Email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/Password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /Sign In/i }));
  
  // Check for loading state
  expect(screen.getByRole('button', { name: /Signing In/i })).toBeDisabled();
});
```

### Example 5: Multiple Field Filling

```typescript
test('fills multiple fields and validates', async () => {
  const user = userEvent.setup();
  
  render(<LoginPage />);
  
  // Fill all fields at once
  const fields = {
    email: 'test@example.com',
    password: 'password123',
  };
  
  await user.type(screen.getByLabelText(/Email/i), fields.email);
  await user.type(screen.getByLabelText(/Password/i), fields.password);
  
  // Verify values
  expect(screen.getByLabelText(/Email/i)).toHaveValue(fields.email);
  expect(screen.getByLabelText(/Password/i)).toHaveValue(fields.password);
});
```

### Example 6: Testing with Different User Scenarios

```typescript
describe('LoginPage - Different User Scenarios', () => {
  test('admin login', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    
    render(<LoginPage />);
    
    await user.type(
      screen.getByLabelText(/Email/i),
      'admin@fahras.edu'
    );
    await user.type(
      screen.getByLabelText(/Password/i),
      'admin_password'
    );
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@fahras.edu',
        password: 'admin_password',
      });
    });
  });
  
  test('student login', async () => {
    const user = userEvent.setup();
    const mockLogin = jest.fn().mockResolvedValue(undefined);
    
    render(<LoginPage />);
    
    await user.type(
      screen.getByLabelText(/Email/i),
      'ahmed.almansouri@student.fahras.edu'
    );
    await user.type(
      screen.getByLabelText(/Password/i),
      'password'
    );
    await user.click(screen.getByRole('button', { name: /Sign In/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'ahmed.almansouri@student.fahras.edu',
        password: 'password',
      });
    });
  });
});
```

---

## Common Patterns

### Pattern 1: Setup and Teardown

```typescript
describe('LoginPage', () => {
  let user: ReturnType<typeof userEvent.setup>;
  
  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  test('example test', async () => {
    render(<LoginPage />);
    // Test code here
  });
});
```

### Pattern 2: Reusable Test Helpers

```typescript
const fillLoginForm = async (
  user: ReturnType<typeof userEvent.setup>,
  email: string,
  password: string
) => {
  await user.type(screen.getByLabelText(/Email/i), email);
  await user.type(screen.getByLabelText(/Password/i), password);
};

const submitLoginForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(screen.getByRole('button', { name: /Sign In/i }));
};

// Usage in tests
test('login with helper functions', async () => {
  const user = userEvent.setup();
  render(<LoginPage />);
  
  await fillLoginForm(user, 'test@example.com', 'password123');
  await submitLoginForm(user);
  
  // Assertions
});
```

### Pattern 3: Testing with Fixtures

```typescript
const testUsers = {
  admin: {
    email: 'admin@fahras.edu',
    password: 'admin_password',
  },
  student: {
    email: 'ahmed.almansouri@student.fahras.edu',
    password: 'password',
  },
  faculty: {
    email: 'sarah.johnson@fahras.edu',
    password: 'password',
  },
};

describe.each(Object.entries(testUsers))(
  'LoginPage - %s login',
  (userType, credentials) => {
    test('logs in successfully', async () => {
      const user = userEvent.setup();
      const mockLogin = jest.fn().mockResolvedValue(undefined);
      
      render(<LoginPage />);
      
      await user.type(screen.getByLabelText(/Email/i), credentials.email);
      await user.type(screen.getByLabelText(/Password/i), credentials.password);
      await user.click(screen.getByRole('button', { name: /Sign In/i }));
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith(credentials);
      });
    });
  }
);
```

---

## Debugging Tips

### Tip 1: Print the DOM

```typescript
test('debug test', async () => {
  const { debug } = render(<LoginPage />);
  
  // Print the entire DOM
  debug();
  
  // Print a specific element
  debug(screen.getByLabelText(/Email/i));
});
```

### Tip 2: Check Input Values

```typescript
test('verify input values', async () => {
  const user = userEvent.setup();
  
  render(<LoginPage />);
  
  const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
  
  await user.type(emailInput, 'test@example.com');
  
  // Check the actual value
  console.log('Email value:', emailInput.value);
  expect(emailInput.value).toBe('test@example.com');
});
```

### Tip 3: Wait for Elements

```typescript
test('wait for element to appear', async () => {
  const user = userEvent.setup();
  
  render(<LoginPage />);
  
  await user.click(screen.getByRole('button', { name: /Sign In/i }));
  
  // Wait for error message to appear
  const errorMessage = await screen.findByText('Email is required');
  expect(errorMessage).toBeInTheDocument();
});
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test LoginPage

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run tests with verbose output
npm test -- --verbose
```

---

## Key Takeaways

1. **Always use userEvent** for user interactions
2. **Always await userEvent calls** - they are async
3. **Use waitFor for async operations** - API calls, state updates
4. **Mock external dependencies** - auth store, API calls
5. **Test user behavior** - not implementation details
6. **Use screen queries** - getByRole, getByLabelText, etc.
7. **Avoid testing implementation** - focus on user experience
