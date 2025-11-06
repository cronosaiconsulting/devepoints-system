#!/bin/bash
echo "Running database migrations..."
npm run migrate:updates
echo "Migrations completed!"
