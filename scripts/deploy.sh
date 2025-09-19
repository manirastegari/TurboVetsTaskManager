#!/bin/bash

# TurboVets Task Manager Deployment Script
# This script builds and prepares the application for deployment

set -e

echo "🚀 Starting TurboVets Task Manager deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building backend API..."
npx nx build api

echo "🔨 Building frontend dashboard..."
npx nx build dashboard

echo "🧪 Running tests..."
npx nx test api --watch=false
npx nx test dashboard --watch=false

echo "✅ Build completed successfully!"
echo ""
echo "📁 Build artifacts:"
echo "   - Backend: dist/apps/api"
echo "   - Frontend: dist/apps/dashboard"
echo ""
echo "🌐 To run the application:"
echo "   1. Start backend: npx nx serve api"
echo "   2. Start frontend: npx nx serve dashboard"
echo "   3. Open http://localhost:4200 in your browser"
echo ""
echo "🔐 Test accounts:"
echo "   - Owner: owner@turbovets.com / password123"
echo "   - Admin: admin@turbovets.com / password123"
echo "   - Viewer: viewer@turbovets.com / password123"
echo ""
echo "🎉 Deployment preparation complete!"
