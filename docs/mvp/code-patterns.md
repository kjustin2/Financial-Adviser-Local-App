# Code Patterns and Architecture Guidelines

This document outlines the code patterns, architectural decisions, and best practices used in the Financial Adviser Local Application.

## Project Architecture Overview

### Technology Stack Patterns
- **Backend**: FastAPI + SQLAlchemy + Pydantic (Python 3.11+)
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **Database**: SQLite (development) → PostgreSQL (production/SaaS)
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Design**: RESTful with OpenAPI/Swagger documentation

## Backend Patterns

### 1. Layered Architecture

```
app/
├── main.py              # FastAPI application entry point
├── config.py            # Configuration management
├── database.py          # Database connection and session management
├── models/              # SQLAlchemy ORM models (Data Layer)
├── schemas/             # Pydantic models (API Layer)
├── api/                 # API routes and endpoints (Presentation Layer)
├── services/            # Business logic (Service Layer)
├── security/            # Authentication and encryption utilities
└── utils/               # Shared utilities
```

#### Benefits:
- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Easy to unit test individual layers
- **Maintainability**: Changes in one layer don't affect others
- **Scalability**: Clear boundaries for future architectural changes

### 2. Dependency Injection Pattern

```python
# api/deps.py - Centralized dependencies
from fastapi import Depends
from sqlalchemy.orm import Session
from .database import get_db
from .security.auth import get_current_user

def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Usage in endpoints
@router.get("/")
def get_clients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    return crud.get_clients(db, user_id=current_user.id)
```

#### Benefits:
- **Testability**: Easy to mock dependencies for testing
- **Reusability**: Dependencies can be shared across endpoints
- **Security**: Centralized authentication and authorization logic

### 3. Repository Pattern (via SQLAlchemy)

```python
# models/client.py - Data models with business logic
class Client(BaseModel):
    # Model definition...
    
    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
    
    @property
    def age(self) -> int | None:
        if self.date_of_birth:
            # Age calculation logic
            pass

# services/client_service.py - Business logic layer
class ClientService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_client(self, client_data: ClientCreate, user_id: int) -> Client:
        # Business logic for client creation
        db_client = Client(user_id=user_id, **client_data.dict())
        self.db.add(db_client)
        self.db.commit()
        return db_client
```

#### Benefits:
- **Business Logic Encapsulation**: Domain logic stays with the model
- **Database Abstraction**: Easy to switch between databases
- **Query Optimization**: SQLAlchemy handles complex queries efficiently

### 4. Pydantic Schema Validation

```python
# schemas/client.py - Request/Response validation
class ClientBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    risk_tolerance: RiskTolerance = RiskTolerance.MODERATE

class ClientCreate(ClientBase):
    pass  # Inherits validation from base

class ClientResponse(BaseSchema):
    id: int
    created_at: datetime
    # Additional computed fields
    
    class Config:
        from_attributes = True  # SQLAlchemy ORM compatibility
```

#### Benefits:
- **Type Safety**: Automatic validation and type conversion
- **API Documentation**: Automatic OpenAPI schema generation
- **Error Handling**: Clear validation error messages
- **IDE Support**: Full autocomplete and type checking

### 5. Security Patterns

#### JWT Authentication
```python
# security/auth.py
def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

#### Encrypted Configuration Storage
```python
# security/encryption.py
class SecureConfigManager:
    def encrypt_config(self, config: Dict[str, Any]) -> None:
        key = self.get_key()
        fernet = Fernet(key)
        encrypted_data = fernet.encrypt(json.dumps(config).encode())
        # Store encrypted data with restricted file permissions
```

#### Benefits:
- **Data Protection**: Sensitive data encrypted at rest
- **Secure Authentication**: Industry-standard JWT implementation
- **Password Security**: bcrypt hashing with salt

### 6. Error Handling Patterns

```python
# Global exception handlers
@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Invalid input data",
                "details": exc.errors()
            },
            "timestamp": datetime.utcnow().isoformat()
        }
    )
```

#### Benefits:
- **Consistent Error Format**: Standardized error responses
- **Client-Friendly**: Clear error messages for frontend handling
- **Debugging**: Detailed error information in development

## Frontend Patterns

### 1. Component-Based Architecture

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives (shadcn/ui)
│   ├── layout/          # Layout components (Header, Sidebar, etc.)
│   ├── forms/           # Form components with validation
│   ├── charts/          # Data visualization components
│   ├── tables/          # Data table components
│   └── common/          # Shared utility components
├── pages/               # Page-level components
├── hooks/               # Custom React hooks
├── services/            # API service layer
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── store/               # State management
```

#### Benefits:
- **Reusability**: Components can be used across different pages
- **Maintainability**: Changes isolated to specific components
- **Testing**: Easy to test individual components
- **Consistency**: Shared design system via shadcn/ui

### 2. Custom Hooks Pattern

```typescript
// hooks/useApi.ts - Reusable API logic
export function useApi<T>(
  apiCall: () => Promise<T>,
  options?: UseQueryOptions<T>
) {
  return useQuery({
    queryFn: apiCall,
    ...options
  });
}

// hooks/useClients.ts - Domain-specific hooks
export function useClients() {
  return useApi(() => clientService.getClients());
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: clientService.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
    }
  });
}
```

#### Benefits:
- **Logic Reuse**: Share stateful logic between components
- **Separation of Concerns**: Keep API logic separate from UI logic
- **Performance**: Built-in caching with React Query

### 3. Service Layer Pattern

```typescript
// services/api.ts - Base API configuration
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// services/clients.ts - Domain-specific API calls
export const clientService = {
  async getClients(): Promise<Client[]> {
    const response = await api.get('/clients');
    return response.data.data;
  },
  
  async createClient(clientData: ClientCreate): Promise<Client> {
    const response = await api.post('/clients', clientData);
    return response.data.data;
  }
};
```

#### Benefits:
- **API Centralization**: All API calls in one place
- **Error Handling**: Consistent error handling across the app
- **Authentication**: Automatic token handling
- **Type Safety**: Full TypeScript support

### 4. Type-Safe State Management

```typescript
// types/api.ts - Shared type definitions
export interface Client {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  risk_tolerance: RiskTolerance;
  created_at: string;
}

// store/authSlice.ts - Typed state management
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isAuthenticated: false,
  } as AuthState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    }
  }
});
```

#### Benefits:
- **Type Safety**: Compile-time error checking
- **IDE Support**: Full autocomplete and IntelliSense
- **Refactoring**: Safe refactoring with TypeScript

### 5. Form Handling with Validation

```typescript
// Using react-hook-form with Zod validation
const clientSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email().optional(),
  risk_tolerance: z.enum(["conservative", "moderate", "aggressive"])
});

type ClientFormData = z.infer<typeof clientSchema>;

export function ClientForm() {
  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      risk_tolerance: "moderate"
    }
  });

  const onSubmit = (data: ClientFormData) => {
    // Handle form submission
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

#### Benefits:
- **Validation**: Client-side and type-safe validation
- **Performance**: Optimized re-renders
- **User Experience**: Real-time validation feedback

## Database Patterns

### 1. Base Model Pattern

```python
# models/base.py
class BaseModel(Base):
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True, nullable=False)
```

#### Benefits:
- **Consistency**: All models have common fields
- **Soft Deletion**: Using `is_active` flag instead of hard deletes
- **Audit Trail**: Automatic timestamps for all records

### 2. Relationship Patterns

```python
# One-to-Many with back_populates
class Client(BaseModel):
    portfolios = relationship("Portfolio", back_populates="client", cascade="all, delete-orphan")

class Portfolio(BaseModel):
    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    client = relationship("Client", back_populates="portfolios")
```

#### Benefits:
- **Data Integrity**: Foreign key constraints ensure consistency
- **Lazy Loading**: Efficient loading of related data
- **Cascade Operations**: Automatic cleanup of related records

### 3. Computed Properties

```python
class Portfolio(BaseModel):
    @property
    def total_value(self) -> Decimal:
        if not self.holdings:
            return Decimal("0.00")
        return sum(holding.current_value for holding in self.holdings if holding.is_active)
    
    @property
    def unrealized_gain_loss(self) -> Decimal:
        return self.total_value - self.total_cost_basis
```

#### Benefits:
- **Business Logic**: Domain calculations stay with the model
- **Performance**: Computed on-demand, not stored
- **Maintainability**: Single source of truth for calculations

## Security Patterns

### 1. Input Validation
- **Pydantic Schemas**: Automatic validation of all API inputs
- **SQL Injection Prevention**: SQLAlchemy ORM with parameterized queries
- **XSS Prevention**: React's built-in protection + proper data handling

### 2. Authentication & Authorization
- **JWT Tokens**: Stateless authentication
- **Password Hashing**: bcrypt with salt
- **Role-Based Access**: User ownership validation on all operations

### 3. Data Protection
- **Local Storage**: All financial data stays on user's machine
- **Encrypted Configuration**: API keys encrypted with AES-256
- **Secure Defaults**: HTTPS enforced, secure headers

## Testing Patterns

### Backend Testing
```python
# tests/conftest.py - Test fixtures
@pytest.fixture
def db_session():
    # Create test database session
    pass

@pytest.fixture
def client(db_session):
    # Create test client with overridden dependencies
    pass

# tests/test_api/test_clients.py
def test_create_client(client, db_session):
    client_data = {"first_name": "John", "last_name": "Doe"}
    response = client.post("/api/v1/clients/", json=client_data)
    assert response.status_code == 201
```

### Frontend Testing
```typescript
// tests/components/ClientCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ClientCard } from '../ClientCard';

describe('ClientCard', () => {
  it('renders client information correctly', () => {
    const client = { id: 1, first_name: 'John', last_name: 'Doe' };
    render(<ClientCard client={client} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

## Performance Patterns

### Backend Optimization
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Query Optimization**: Eager loading for N+1 prevention
- **Connection Pooling**: SQLAlchemy connection management
- **Caching**: Redis for session management (future SaaS)

### Frontend Optimization
- **Code Splitting**: Lazy loading with React.lazy()
- **Memoization**: React.memo for expensive components
- **State Management**: Selective re-renders with proper state design
- **Bundle Optimization**: Vite's automatic optimizations

## Development Workflow Patterns

### 1. Git Workflow
- **Feature Branches**: `feature/description`
- **Conventional Commits**: Consistent commit message format
- **Pull Request Review**: Code quality gates

### 2. Code Quality
- **Linting**: ESLint (frontend) + ruff (backend)
- **Formatting**: Prettier (frontend) + Black (backend)
- **Type Checking**: TypeScript + mypy
- **Testing**: Comprehensive test coverage

### 3. Documentation
- **API Documentation**: Automatic OpenAPI generation
- **Type Documentation**: TypeScript interfaces as documentation
- **README**: Comprehensive setup and usage instructions

These patterns ensure the codebase is maintainable, scalable, secure, and follows industry best practices for modern web applications.