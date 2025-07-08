#!/bin/bash

echo "Starting Financial Adviser Application..."
echo

# Check if Poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "Error: Poetry is not installed or not in PATH"
    echo "Please install Poetry from https://python-poetry.org/docs/#installation"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

# Install dependencies if not already installed
echo "Checking and installing dependencies..."
npm run install:all

# Start the application
echo
echo "Starting both backend and frontend servers..."
echo "Backend will run on: http://localhost:8000"
echo "Frontend will run on: http://localhost:5173"
echo
echo "Press Ctrl+C to stop both servers"
echo

npm run dev:all