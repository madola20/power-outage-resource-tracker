# Initialization# Scout - Power Outage Resource Tracker

A comprehensive CRM-like application for tracking and managing power outages, built with Django and React.

## 🚀 Features

- **Multi-role User System**: Admin, Team Lead, Team Member, and Reporter roles with different permissions
- **Location Management**: Track power outage locations with status updates and assignments
- **Real-time Dashboard**: Monitor outage statistics and recent activity
- **Mobile-Responsive**: Optimized for both desktop and mobile devices
- **Docker Support**: Easy deployment with Docker and Docker Compose

## 🏗️ Architecture

- **Backend**: Django 5.2.6 with Django REST Framework
- **Frontend**: React 18 with TypeScript and Mantine UI
- **Database**: PostgreSQL 15
- **Cache**: Redis 7
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Docker and Docker Compose
- Git
- Node.js 18+ (for local development)
- Python 3.12+ (for local development)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd scout
```

### 2. Environment Setup

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
POSTGRES_DB=scout_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_HOST=localhost
POSTGRES_PORT=5433

# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=true
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0,backend

# Redis Configuration (optional)
REDIS_URL=redis://localhost:6379/0

# Frontend Configuration
DOCKER=false
```

### 3. Start the Application

#### Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Run initial setup
./scripts/docker-setup.ps1  # Windows PowerShell
# or
./scripts/docker-setup.sh   # Linux/macOS
```

#### Local Development

```bash
# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
# or
venv\Scripts\activate     # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (in another terminal)
cd frontend
npm install
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Django Admin**: http://localhost:8000/admin
- **Database**: localhost:5433 (PostgreSQL)

## 👥 User Roles & Permissions

### Admin
- Full system access
- Can view all locations
- Can assign locations to any user
- Can manage users and system settings

### Team Lead
- Can view assigned locations
- Can assign locations to themselves and team members
- Can update location status and priority

### Team Member
- Can view assigned locations
- Can update location status and add notes
- Cannot assign locations to others

### Reporter
- Can create new location reports
- Can view their own reported locations
- Cannot assign or update locations

## 📊 Database Schema

### Users
- Custom user model with role-based permissions
- Email-based authentication
- Profile information (name, phone, role)

### Locations
- Power outage location tracking
- Status management (reported, investigating, in progress, resolved, cancelled)
- Priority levels (low, medium, high, critical)
- Assignment to team members
- Geographic coordinates and address information

### Location Updates
- Audit trail for location changes
- Status updates and notes
- Assignment history

## 🔧 Development

### API Endpoints

#### Authentication
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/register/` - User registration

#### Users
- `GET /api/users/` - List users (admin only)
- `GET /api/users/profile/` - Get current user profile
- `PUT /api/users/profile/` - Update user profile

#### Locations
- `GET /api/locations/` - List locations (filtered by role)
- `POST /api/locations/` - Create new location
- `GET /api/locations/{id}/` - Get location details
- `PUT /api/locations/{id}/` - Update location
- `POST /api/locations/{id}/assign/` - Assign location

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `POSTGRES_DB` | Database name | Yes |
| `POSTGRES_USER` | Database username | Yes |
| `POSTGRES_PASSWORD` | Database password | Yes |
| `POSTGRES_HOST` | Database host | Yes |
| `POSTGRES_PORT` | Database port | Yes |
| `SECRET_KEY` | Django secret key | Yes |
| `DEBUG` | Debug mode | Yes |
| `ALLOWED_HOSTS` | Allowed hosts | Yes |
| `REDIS_URL` | Redis connection URL | No |
| `DOCKER` | Docker environment flag | No |

## 🐳 Docker

### Services

- **db**: PostgreSQL database
- **redis**: Redis cache
- **backend**: Django application
- **frontend**: React development server

### Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Run Django commands
docker-compose exec backend python manage.py <command>

# Access database
docker-compose exec db psql -U postgres -d scout_db
```

## �� Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## �� Security

- Environment variables are used for all sensitive configuration
- No secrets are committed to version control
- CSRF protection enabled
- Token-based authentication
- Role-based access control

## 📚 Documentation

- [Docker Setup Guide](DOCKER_README.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)

## �� Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check if PostgreSQL container is running
   - Verify database credentials in `.env`
   - Ensure port mapping is correct

2. **Frontend Can't Connect to Backend**
   - Check if backend container is running
   - Verify CORS settings
   - Check network connectivity between containers

3. **Permission Denied Errors**
   - Verify user role and permissions
   - Check if user is authenticated
   - Review API endpoint permissions

### Getting Help

- Check the [Issues](https://github.com/your-repo/issues) page
- Review the [Docker Setup Guide](DOCKER_README.md)
- Contact the development team

## �� Acknowledgments

- Built with [Django](https://www.djangoproject.com/)
- Frontend powered by [React](https://reactjs.org/) and [Mantine](https://mantine.dev/)
- Containerized with [Docker](https://www.docker.com/)
- Database by [PostgreSQL](https://www.postgresql.org/)