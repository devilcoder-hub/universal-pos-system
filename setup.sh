#!/bin/bash

set -e

echo "======================================"
echo "Universal POS System - Setup Script"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker Compose found${NC}"

# Create .env file if it doesn't exist
if [ ! -f ./backend/.env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓ .env file created. Please update with your credentials.${NC}"
fi

# Build and start containers
echo -e "${YELLOW}Building and starting containers...${NC}"
docker-compose up --build -d

echo -e "${GREEN}\n✓ Setup complete!${NC}"
echo -e "${GREEN}✓ Backend API: http://localhost:5000${NC}"
echo -e "${GREEN}✓ Web Dashboard: http://localhost:3000${NC}"
echo -e "${GREEN}✓ Database: localhost:5432${NC}"
echo -e "${YELLOW}\nDefault login:${NC}"
echo -e "  Username: admin"
echo -e "  Password: admin123"

echo -e "${YELLOW}\nTo view logs:${NC}"
echo -e "  docker-compose logs -f"

echo -e "${YELLOW}\nTo stop services:${NC}"
echo -e "  docker-compose down"
