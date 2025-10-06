# Fahras - Graduation Project Archiving System

A comprehensive graduation project archiving system built with Laravel 11 and React 18, featuring advanced search, evaluation workflows, and analytics.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Automated Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/omd0/Fahras.git
   cd Fahras
   ```

2. **Run the setup script**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

3. **Start the application**
   ```bash
   docker compose up -d
   ```

4. **Access the application**
   - **Frontend**: http://localhost:3000
   - **API**: http://localhost/api
   - **Database**: localhost:5433 (PostgreSQL)

### Manual Setup

If you prefer manual setup or the automated script fails:

1. **Clone and navigate**
   ```bash
   git clone https://github.com/omd0/Fahras.git
   cd Fahras
   ```

2. **Create environment files**
   ```bash
   cp api/env.example api/.env
   cp web/env.example web/.env
   ```

3. **Start database and Redis services**
   ```bash
   docker compose up -d db redis
   ```

4. **Wait for database to be ready** (about 10 seconds)

5. **Setup Laravel backend**
   ```bash
   # Install dependencies
   docker compose exec -T php composer install
   
   # Generate application key
   docker compose exec -T php php artisan key:generate
   
   # Run database migrations
   docker compose exec -T php php artisan migrate
   
   # Seed initial data
   docker compose exec -T php php artisan db:seed
   ```

6. **Setup React frontend**
   ```bash
   # Install dependencies
   docker compose exec -T node npm install
   ```

7. **Start all services**
   ```bash
   docker compose up -d
   ```

## 🎯 Default Login Credentials

After running the setup, you can use these default accounts:

- **Admin**: `admin@fahras.edu` / `password`
- **Faculty**: `sarah.johnson@fahras.edu` / `password`
- **Student**: `ahmed.almansouri@student.fahras.edu` / `password`

### 🔑 Current Working Credentials

Based on the seeded database, these accounts are available:

- **Faculty Member**: `sarah.johnson@fahras.edu` / `password`
- **Student**: `ahmed.almansouri@student.fahras.edu` / `password`
- **Admin**: `admin@fahras.edu` / `password`

**Note**: All users have the password `password` by default. You can change passwords after logging in through the user management interface.

## 🏗️ Architecture

### Backend (Laravel 11)
- **Framework**: Laravel 11 with API-only configuration
- **Authentication**: Laravel Sanctum for SPA authentication
- **Database**: PostgreSQL 16
- **Storage**: Local file storage (configurable for cloud)
- **API**: RESTful API with JSON responses

### Frontend (React 18)
- **Framework**: React 18 with TypeScript
- **UI Library**: Material-UI (MUI) v7
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v7

### Development Environment
- **Containerization**: Docker Compose
- **Web Server**: Nginx
- **Database**: PostgreSQL 16
- **Cache**: Redis

## 📁 Project Structure

```
Fahras/
├── api/                    # Laravel backend
│   ├── app/
│   │   ├── Http/Controllers/
│   │   ├── Models/
│   │   └── Providers/
│   ├── database/migrations/
│   ├── routes/api.php
│   ├── composer.json
│   └── Dockerfile
├── web/                    # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── store/
│   │   └── types/
│   ├── package.json
│   └── public/
├── docker-compose.yml
├── nginx.conf
├── setup.sh
└── README.md
```

## 🔧 Development Commands

### Backend (Laravel)
```bash
# Enter PHP container
docker compose exec php bash

# Run migrations
php artisan migrate

# Seed database
php artisan db:seed

# Generate application key
php artisan key:generate

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Run tests
php artisan test
```

### Frontend (React)
```bash
# Enter Node container
docker compose exec node bash

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Lint and fix
npm run lint -- --fix
```

### Docker Commands
```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs -f [service_name]

# Restart a specific service
docker compose restart [service_name]

# Rebuild containers
docker compose up -d --build

# Remove all containers and volumes
docker compose down -v
```

## 📋 Available Services

| Service | Port | Description |
|---------|------|-------------|
| nginx | 80 | Web server and reverse proxy |
| php | 9000 | Laravel PHP-FPM service |
| node | 3000 | React development server |
| db | 5433 | PostgreSQL database |
| redis | 6379 | Redis cache server |

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user
- `POST /api/refresh` - Refresh token

### Projects
- `GET /api/projects` - List projects (with filtering)
- `POST /api/projects` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

### Files
- `POST /api/projects/{id}/files` - Upload file
- `GET /api/projects/{id}/files` - List project files
- `GET /api/files/{id}/download` - Download file
- `DELETE /api/files/{id}` - Delete file

### Academic Structure
- `GET /api/departments` - List departments
- `GET /api/programs` - List programs
- `GET /api/faculties` - List faculties

## 🧪 Testing

### Backend Testing
```bash
# Run Laravel tests
docker compose exec php php artisan test

# Run specific test
docker compose exec php php artisan test --filter=ProjectTest
```

### Frontend Testing
```bash
# Run React tests
docker compose exec node npm test

# Run tests with coverage
docker compose exec node npm test -- --coverage
```

## 📝 Environment Variables

### Backend (api/.env)
```env
APP_NAME="Fahras API"
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=db
DB_PORT=5432
DB_DATABASE=fahras
DB_USERNAME=fahras
DB_PASSWORD=fahras_password

REDIS_HOST=redis
REDIS_PORT=6379
```

### Frontend (web/.env)
```env
REACT_APP_API_URL=http://localhost/api
REACT_APP_APP_NAME=Fahras
```

## 🚨 Troubleshooting

### Common Issues

1. **Database connection failed**
   ```bash
   # Check if database is running
   docker compose ps db
   
   # Restart database
   docker compose restart db
   
   # Check database logs
   docker compose logs db
   ```

2. **Laravel key not generated**
   ```bash
   docker compose exec php php artisan key:generate
   ```

3. **Migration errors**
   ```bash
   # Reset database
   docker compose exec php php artisan migrate:fresh --seed
   ```

4. **React build errors**
   ```bash
   # Clear node modules and reinstall
   docker compose exec node rm -rf node_modules package-lock.json
   docker compose exec node npm install
   ```

5. **Port conflicts**
   ```bash
   # Check what's using the ports
   sudo netstat -tulpn | grep :3000
   sudo netstat -tulpn | grep :80
   
   # Stop conflicting services or change ports in docker-compose.yml
   ```

### Logs and Debugging
```bash
# View all logs
docker compose logs

# View specific service logs
docker compose logs -f php
docker compose logs -f node
docker compose logs -f nginx
docker compose logs -f db

# Enter container for debugging
docker compose exec php bash
docker compose exec node sh
```

## 🔄 Development Workflow

1. **Make changes to your code**
2. **For Laravel changes**: The container will auto-reload
3. **For React changes**: The dev server will hot-reload
4. **Test your changes**: Use the testing commands above
5. **Check logs**: Monitor logs for any issues

## 🚀 Production Deployment

For production deployment, see the `Dockerfile.production` and `nginx.production.conf` files. The production setup includes:

- Optimized Docker images
- Production-ready Nginx configuration
- Environment-specific settings
- Security hardening

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section above

---

**Note**: This is a comprehensive graduation project archiving system. For production use, additional security measures, testing, and optimization would be required.