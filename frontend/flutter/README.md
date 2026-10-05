# Universal POS Flutter App

Cross-platform Point of Sale application built with Flutter

## Features

- User Authentication
- Product Management
- Shopping Cart
- Order Processing
- Multi-Currency Support
- Real-time Inventory
- Sales Reports
- Customer Management

## Installation

1. Install Flutter from https://flutter.dev

2. Install dependencies:
```bash
flutter pub get
```

3. Run the app:
```bash
flutter run
```

## Configuration

Update the API base URL in `lib/services/api_service.dart`:

```dart
static const String baseUrl = 'http://your-server:5000/api';
```

## Build for Production

### Android
```bash
flutter build apk
flutter build appbundle
```

### iOS
```bash
flutter build ios
```

### Windows
```bash
flutter build windows
```

### Linux
```bash
flutter build linux
```

## Backend Connection

Make sure your backend server is running on http://localhost:5000

Test login credentials:
- Username: admin
- Password: admin123
