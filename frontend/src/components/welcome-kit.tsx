"use client";

import { Device } from "@/app/devices/schema";
import { User } from "@/app/users/schema";
import Image from "next/image";
import logo from "@/assets/logo.png";

type ExtendedUser = User & { password?: string; password_hash?: string; plainPassword?: string };

interface WelcomeKitProps {
  device: Device;
  user?: ExtendedUser | undefined;
  onClose?: () => void;
}

export function WelcomeKit({ device, user, onClose }: WelcomeKitProps) {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="welcome-kit-print p-8 max-w-4xl mx-auto bg-white text-black">
      {/* Print-specific styles */}
      <style jsx global>{`
        @media print {
          .welcome-kit-print {
            margin: 0;
            padding: 20px;
            max-width: none;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Image
            src={(logo as any).src || (logo as any)}
            alt="OorjaWheel Logo"
            width={120}
            height={120}
            className="rounded-full"
          />
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome to OorjaWheel</h1>
        <p className="text-xl text-gray-600">Your Smart Wheel Experience Starts Here</p>
        <div className="mt-4 text-sm text-gray-500">
          Generated on {currentDate}
        </div>
      </div>

      {/* Device Information */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b border-gray-300 pb-2">
          Device Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-700">Device Name:</span>
              <p className="text-gray-900">{device.deviceName || 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Device Type:</span>
              <p className="text-gray-900">{device.deviceType || 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">MAC Address:</span>
              <p className="text-gray-900 font-mono text-sm">{device.macAddress || 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Status:</span>
              <p className="text-gray-900 capitalize">{device.status || 'N/A'}</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-gray-700">Bluetooth Name:</span>
              <p className="text-gray-900">{(device as any).btName || 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Default Command:</span>
              <p className="text-gray-900">{(device as any).defaultCmd || 'N/A'}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Created:</span>
              <p className="text-gray-900">
                {device.createdAt ? new Date(device.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Last Updated:</span>
              <p className="text-gray-900">
                {device.updatedAt ? new Date(device.updatedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Access Credentials */}
      <div className="bg-blue-50 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-blue-800 mb-4 border-b border-blue-300 pb-2">
          Access Credentials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">Device Passcode</h3>
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-blue-900 bg-blue-100 px-4 py-2 rounded">
                {device.passcode || 'N/A'}
              </div>
              <p className="text-sm text-blue-600 mt-2">Use this code to connect your device</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-700 mb-3">User Information</h3>
            {user ? (
              <div className="space-y-2">
                {/* <div>
                  <span className="font-semibold text-gray-700">User ID:</span>
                  <p className="text-gray-900 font-mono">{device.userId}</p>
                </div> */}
                <div>
                  <span className="font-semibold text-gray-700">Full Name:</span>
                  <p className="text-gray-900">{user.fullName || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Email:</span>
                  <p className="text-gray-900">{user.email}</p>
                </div>
                {/* <div>
                  <span className="font-semibold text-gray-700">Contact:</span>
                  <p className="text-gray-900">{user.contactNumber || 'N/A'}</p>
                </div> */}
                {/* <div>
                  <span className="font-semibold text-gray-700">Password:</span>
                  <p className="text-gray-900 font-mono">{user.password || user.password_hash || (user as any).plainPassword || 'N/A'}</p>
                </div> */}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <p className="text-lg">Device Not Assigned</p>
                <p className="text-sm">No user assigned to this device</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warranty Information */}
      {(device as any).warrantyStart && (
        <div className="bg-green-50 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold text-green-800 mb-4 border-b border-green-300 pb-2">
            Warranty Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-gray-700">Warranty Start Date:</span>
              <p className="text-gray-900">
                {new Date((device as any).warrantyStart).toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">First Connected:</span>
              <p className="text-gray-900">
                {(device as any).firstConnectedAt 
                  ? new Date((device as any).firstConnectedAt).toLocaleDateString()
                  : 'Not connected yet'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-yellow-50 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold text-yellow-800 mb-4 border-b border-yellow-300 pb-2">
          Getting Started
        </h2>
        <div className="space-y-3 text-gray-700">
          <div className="flex items-start">
            <span className="font-semibold mr-2">1.</span>
            <p>Download the OorjaWheel mobile app from your device's app store</p>
          </div>
          <div className="flex items-start">
            <span className="font-semibold mr-2">2.</span>
            <p>Open the app and create an account or log in with your credentials</p>
          </div>
          <div className="flex items-start">
            <span className="font-semibold mr-2">3.</span>
            <p>Enable Bluetooth on your mobile device</p>
          </div>
          <div className="flex items-start">
            <span className="font-semibold mr-2">4.</span>
            <p>Use the passcode <strong>{device.passcode}</strong> to connect your device</p>
          </div>
          <div className="flex items-start">
            <span className="font-semibold mr-2">5.</span>
            <p>Follow the in-app instructions to complete the setup</p>
          </div>
        </div>
      </div>

      {/* Support Information */}
      <div className="text-center text-gray-600 text-sm">
        <p className="mb-2">
          <strong>Need Help?</strong> Contact our support team at support@oorjawheel.com
        </p>
        <p>
          Visit our website at <strong>www.oorjawheel.com</strong> for more information
        </p>
      </div>

      {/* Print Button (only visible on screen) */}
      {onClose && (
        <div className="no-print mt-8 text-center">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-4"
          >
            Print Welcome Kit
          </button>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
