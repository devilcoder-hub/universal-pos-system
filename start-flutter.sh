#!/bin/bash

echo "======================================"
echo "Universal POS Flutter - Start Script"
echo "======================================"

cd frontend/flutter

echo "Installing dependencies..."
flutter pub get

echo "Running Flutter app..."
flutter run
