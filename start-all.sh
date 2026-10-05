#!/bin/bash

echo "======================================"
echo "Universal POS System - Complete Start"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting all services...${NC}"
echo ""

# Start backend in background
echo -e "${GREEN}1. Starting Backend API...${NC}"
cd backend
npm install > /dev/null 2>&1
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}   Backend running (PID: $BACKEND_PID)${NC}"
cd ..

sleep 2

# Start React web in background
echo -e "${GREEN}2. Starting React Dashboard...${NC}"
cd frontend/react
npm install > /dev/null 2>&1
npm start &
REACT_PID=$!
echo -e "${GREEN}   React running (PID: $REACT_PID)${NC}"
cd ../..

echo ""
echo -e "${GREEN}✓ All services started!${NC}"
echo -e "${YELLOW}Backend:${NC} http://localhost:5000"
echo -e "${YELLOW}Dashboard:${NC} http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

wait
