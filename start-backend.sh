#!/bin/bash

echo "======================================"
echo "Universal POS Backend - Start Script"
echo "======================================"

cd backend

echo "Installing dependencies..."
npm install

echo "Starting backend server..."
npm run dev
