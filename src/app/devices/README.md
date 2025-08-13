# Device Management System

## Overview
This device management system provides a complete solution for managing IoT devices and their configurations. It includes functionality for device masters (device types) and individual device instances.

## Features

### Device Masters
- **CRUD Operations**: Create, Read, Update, Delete device types
- **Bluetooth Configuration**: Manage BT service and characteristic UUIDs
- **Sound Configuration**: Configure sound Bluetooth names
- **Status Management**: Active/Inactive status tracking
- **Validation**: Unique device type names and required fields

### Individual Devices
- **CRUD Operations**: Create, Read, Update, Delete individual devices
- **MAC Address Management**: Unique MAC address validation
- **Auto-generated Passcodes**: Automatic passcode generation from MAC address
- **User Assignment**: Assign devices to users
- **Status Tracking**: Never Used, Active, Disabled states
- **Device Type Association**: Link devices to device masters

## Database Schema

### Tables
1. **devices**
   - id (UUID, Primary Key)
   - deviceName (VARCHAR)
   - macAddress (VARCHAR, Unique)
   - deviceType (VARCHAR, Foreign Key)
   - userId (VARCHAR, Nullable)
   - passcode (VARCHAR)
   - status (ENUM)
   - createdAt (TIMESTAMP)
   - updatedAt (TIMESTAMP)

2. **device_masters**
   - id (UUID, Primary Key)
   - deviceType (VARCHAR, Unique)
   - btServe (VARCHAR)
   - btChar (VARCHAR)
   - soundBtName (VARCHAR)
   - status (ENUM)
   - createdAt (TIMESTAMP)
   - updatedAt (TIMESTAMP)

## API Endpoints

### Device Actions
- `addDevice(values)`: Create a new device
- `updateDevice(id, values)`: Update an existing device
- `deleteDevice(id)`: Delete a device
- `fetchDevices(filters)`: Get devices with optional filtering
- `getDeviceById(id)`: Get a single device by ID

### Device Master Actions
- `addDeviceMaster(values)`: Create a new device type
- `updateDeviceMaster(id, values)`: Update a device type
- `deleteDeviceMaster(id)`: Delete a device type
- `fetchDeviceMasters(filters)`: Get device types with optional filtering
- `getDeviceMasterById(id)`: Get a single device type by ID

## Usage

### Adding a Device Master
1. Navigate to the "Device Master" tab
2. Click "Add Device Type"
3. Fill in the required fields:
   - Device Type Name
   - BT Service UUID
   - BT Characteristic UUID
   - Sound BT Name
   - Status (Active/Inactive)

### Adding a Device
1. Navigate to the "Devices" tab
2. Click "Add Device"
3. Fill in the required fields:
   - Device Name
   - MAC Address (format: XX:XX:XX:XX:XX:XX)
   - Device Type (selected from active masters)
   - User ID (optional)
   - Passcode (auto-generated from MAC)

### MAC Address Format
- Must be in format: XX:XX:XX:XX:XX:XX
- Where X is a hexadecimal digit (0-9, A-F)
- Example: 00:1A:2B:3C:4D:5E

### Passcode Generation
- Automatically generated from the last 6 characters of the MAC address
- Example: MAC "00:1A:2B:3C:4D:5E" → Passcode "3C4D5E"

## Validation Rules

### Device Masters
- Device type name must be unique
- All fields are required
- Status must be either 'active' or 'inactive'

### Devices
- MAC address must be unique
- MAC address must be in valid format
- Device type must exist in device_masters
- All fields except userId are required
- Status must be 'never_used', 'active', or 'disabled'

## Error Handling
- All operations include proper error handling
- User-friendly error messages
- Validation before database operations
- Foreign key constraint handling

## Security Considerations
- Input validation on all fields
- SQL injection prevention through parameterized queries
- MAC address format validation
- Unique constraint enforcement

## Performance Optimizations
- Database indexes on frequently queried fields
- Connection pooling for database connections
- Optimized queries with filtering support
- Pagination support for large datasets

## Testing

### Unit Tests
- Test all CRUD operations
- Test validation rules
- Test error handling
- Test edge cases

### Integration Tests
- Test database operations
- Test API endpoints
- Test UI interactions
- Test data flow

## Future Enhancements
- Bulk import/export functionality
- Device firmware management
- Real-time device status updates
- Advanced filtering and search
- Device grouping and tagging
- Audit logging
- API rate limiting
- Webhook notifications
