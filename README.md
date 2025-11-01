# Roofing Service Quote App

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nicolas-bedards-projects/v0-roofing-service-quote-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/GYDjOBz8wMt)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/nicolas-bedards-projects/v0-roofing-service-quote-app](https://vercel.com/nicolas-bedards-projects/v0-roofing-service-quote-app)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/GYDjOBz8wMt](https://v0.dev/chat/projects/GYDjOBz8wMt)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Local development

1. Install dependencies (uses pnpm):
   ```bash
   pnpm install
   ```
2. Copy the sample environment variables file and fill in your keys:
   ```bash
   cp .env.local.example .env.local
   # then edit .env.local
   ```
   Required variables:
   ```env
   GOOGLE_PLACES_API_KEY=your-places-key
   # optional – fallback if you share the same key
   GOOGLE_SOLAR_API_KEY=your-solar-key
   ```
3. Start the dev server:
   ```bash
   pnpm dev
   ```
4. Test Places autocomplete directly:
   ```bash
   curl "http://localhost:3000/api/places/autocomplete?input=Montreal"
   ```
