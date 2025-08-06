#!/bin/bash -e

# and push database schema
npm run db:push

node server.js