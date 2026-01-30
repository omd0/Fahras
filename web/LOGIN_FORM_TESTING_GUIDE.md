# Login Form Testing Guide

## Problem Summary

When testing the LoginPage form programmatically, the React state was not being updated when form inputs were filled. This caused validation errors to persist even after filling the form fields.

### Root Cause

Material-UI TextField components use **controlled inputs**. Simply setting `input.value` directly does NOT trigger React's `onChange` handlers, so the component state remains empty.

```javascript
// ❌ WRONG - This doesn't trigger onChange
const emailInput = document.querySelector('input[name="email"]');
emailInput.value = 'test@example.com';  // State is NOT updated

// ✅ CORRECT - This triggers onChange
await userEvent.type(emailInput, 'test@example.com');  // State IS updated
```

## Solution

Use **`@testing-library/user-event`** instead of directly manipulating the DOM. The `userEvent` library simulates real user interactions and properly triggers React event handlers.

### Key Differences

| Method | Triggers onChange | Recommended |
|--------|------------------|-------------|
| `input.value = 'text'` | ❌ No | Never use |
| `fireEvent.change(input, { target: { value: 'text' } })` | ✅ Yes | For simple cases |
| `await userEvent.type(input, 'text')` | ✅ Yes | **Best practice** |

## Testing Best Practices

### 1. Use userEvent for User Interactions

```typescript
import userEvent from '@testing-library/user-event';

test('updates form state when user types', async () => {
  const user = userEvent.setup();
  
  render(<LoginPage />);
  
  const emailInput = screen.getByLabelText(/Email Address/i);
  
  // ✅ Correct - Simulates real typing
  await user.type(emailInput, 'test@example.com');
  
  expect(emailInput).toHaveValue('test@example.com');
});
```

### 2. Use waitFor for Async Operations

```typescript
test('calls login API with correct credentials', async () => {
  const user = userEvent.setup();
  const mockLogin = jest.fn().mockResolvedValue(undefined);
  
  render(<LoginPage />);
  
  const emailInput = screen.getByLabelText(/Email Address/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const submitButton = screen.getByRole('button', { name: /Sign In/i });
  
  await user.type(emailInput, 'test@example.com');
  await user.type(passwordInput, 'password123');
  await user.click(submitButton);
  
  // ✅ Wait for async login call
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

### 3. Test Validation Errors

```typescript
test('shows validation errors when submitting empty form', async () => {
  const user = userEvent.setup();
  
  render(<LoginPage />);
  
  const submitButton = screen.getByRole('button', { name: /Sign In/i });
  await user.click(submitButton);
  
  // ✅ Wait for validation errors to appear
  await waitFor(() => {
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
```

### 4. Test Error Clearing

```typescript
test('clears field error when user starts typing', async () => {
  const user = userEvent.setup();
  
  render(<LoginPage />);
  
  const emailInput = screen.getByLabelText(/Email Address/i);
  const submitButton = screen.getByRole('button', { name: /Sign In/i });
  
  // Trigger validation error
  await user.click(submitButton);
  
  await waitFor(() => {
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });
  
  // Start typing to clear error
  await user.type(emailInput, 'test@example.com');
  
  // ✅ Error should be cleared
  await waitFor(() => {
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });
});
```

## LoginPage Implementation Details

The LoginPage component is correctly implemented with:

1. **Controlled Inputs**: Uses `value={credentials.email}` and `onChange={handleChange('email')}`
2. **Proper Event Handlers**: `handleChange` function properly updates state
3. **Validation**: `validateForm` function checks email and password
4. **Error Clearing**: Errors are cleared when user starts typing
5. **API Integration**: Calls `login()` from auth store on form submission

### Form State Management

```typescript
const [credentials, setCredentials] = useState<LoginCredentials>({
  email: '',
  password: '',
});

const handleChange = (field: keyof LoginCredentials) => (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  setCredentials(prev => ({
    ...prev,
    [field]: event.target.value,
  }));
  // Clear field error when user starts typing
  if (errors[field]) {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }
};
```

## Running Tests

```bash
# Run all tests
npm test

# Run LoginPage tests only
npm test LoginPage

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Common Testing Mistakes to Avoid

### ❌ Mistake 1: Direct DOM Manipulation

```typescript
// WRONG - State is not updated
const emailInput = document.querySelector('input[name="email"]');
emailInput.value = 'test@example.com';
```

### ❌ Mistake 2: Not Awaiting userEvent

```typescript
// WRONG - userEvent is async
const user = userEvent.setup();
user.type(emailInput, 'test@example.com');  // Missing await
```

### ❌ Mistake 3: Not Using waitFor for Async Operations

```typescript
// WRONG - API call might not have completed
await user.click(submitButton);
expect(mockLogin).toHaveBeenCalled();  // Might fail due to timing

// CORRECT
await waitFor(() => {
  expect(mockLogin).toHaveBeenCalled();
});
```

### ❌ Mistake 4: Not Mocking Dependencies

```typescript
// WRONG - Real API calls in tests
render(<LoginPage />);

// CORRECT - Mock the auth store
jest.mock('../../store', () => ({
  useAuthStore: jest.fn(() => ({
    login: jest.fn(),
    isLoading: false,
    error: null,
  })),
}));
```

## Test Coverage

The LoginPage test suite covers:

- ✅ Form rendering with email and password fields
- ✅ Form state updates when user types
- ✅ Validation errors for empty form
- ✅ Email format validation
- ✅ API call with correct credentials
- ✅ Error clearing when user starts typing
- ✅ Loading state during login
- ✅ Error message display
- ✅ Navigation after successful login
- ✅ Guest continue button

## References

- [Testing Library Documentation](https://testing-library.com/docs/)
- [userEvent API](https://testing-library.com/docs/user-event/intro)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Material-UI Testing Guide](https://mui.com/material-ui/guides/testing/)
