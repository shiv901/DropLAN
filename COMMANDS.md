#!/bin/bash

# DropLAN Project - Essential Commands Guide

# Run this file for quick reference: chmod +x commands.sh && ./commands.sh

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║ DropLAN Project - Essential Commands & Project Status ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

echo "📋 QUICK START - 3 Ways to Run the Project"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1️⃣ FULL STACK (All services - Recommended)"
echo " Command: npm run dev"
echo " Starts:"
echo " • Electron app (native window)"
echo " • Express server (http://localhost:3000)"
echo " • React dev server (http://localhost:5173)"
echo ""

echo "2️⃣ CLIENT ONLY (React development)"
echo " Command: npm run dev --workspace=packages/client"
echo " Starts: Vite on http://localhost:5173 with HMR"
echo ""

echo "3️⃣ SERVER ONLY (Express + Socket.IO)"
echo " Command: npm run dev --workspace=packages/server"
echo " Starts: Server on http://localhost:3000"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "✅ QUALITY & BUILD COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Type Check (TypeScript validation):"
echo " npm run type-check"
echo ""

echo "Lint Code (ESLint):"
echo " npm run lint"
echo ""

echo "Format Code (Prettier - auto-fix):"
echo " npm run format"
echo ""

echo "Full CI Pipeline (type-check → lint → format):"
echo " npm run ci"
echo ""

echo "Build All Packages:"
echo " npm run build"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🧪 TESTING COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Run All Tests:"
echo " npm run test"
echo ""

echo "Test Individual Packages:"
echo " npm run test --workspace=packages/client"
echo " npm run test --workspace=packages/server"
echo " npm run test --workspace=packages/types"
echo " npm run test --workspace=packages/electron"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🔍 API TESTING (After starting server)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Health Check:"
echo " curl http://localhost:3000/api/health"
echo " Expected: {\"status\":\"ok\",\"timestamp\":\"...\"}"
echo ""

echo "Server Status:"
echo " curl http://localhost:3000/api/status"
echo " Expected: {\"status\":\"running\",\"port\":3000,\"version\":\"0.1.0\"}"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📦 INDIVIDUAL PACKAGE COMMANDS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Client Package:"
echo " npm run dev --workspace=packages/client # Start dev server"
echo " npm run build --workspace=packages/client # Production build"
echo " npm run test --workspace=packages/client # Run tests"
echo ""

echo "Server Package:"
echo " npm run dev --workspace=packages/server # Start server"
echo " npm run build --workspace=packages/server # Compile TypeScript"
echo " npm run test --workspace=packages/server # Run tests"
echo ""

echo "Electron Package:"
echo " npm run dev --workspace=packages/electron # Start Electron"
echo " npm run build --workspace=packages/electron # Build app"
echo ""

echo "Types Package:"
echo " npm run test --workspace=packages/types # Run type tests"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "📊 CURRENT PROJECT STATUS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Phase 1 Progress: 12/23 tasks (52%)"
echo ""

echo "What's Working:"
echo " ✅ Monorepo structure (4 workspaces)"
echo " ✅ TypeScript strict mode"
echo " ✅ React + Vite with HMR"
echo " ✅ Tailwind CSS"
echo " ✅ Zustand state management"
echo " ✅ React Query + Axios"
echo " ✅ Express server"
echo " ✅ Socket.IO ready"
echo " ✅ Configuration management"
echo " ✅ Logging system"
echo " ✅ 17 test cases passing"
echo ""

echo "Build Output:"
echo " • Client: 54.47 kB (gzipped)"
echo " • CSS: 1.68 kB (gzipped)"
echo " • Test cases: 17 passing"
echo ""

echo "Quality:"
echo " • TypeScript: ✅ Strict mode"
echo " • ESLint: ✅ 0 errors"
echo " • Prettier: ✅ 100% compliant"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🚀 RECOMMENDED WORKFLOW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "1. Check quality before starting development:"
echo " npm run ci"
echo ""

echo "2. Start full development server:"
echo " npm run dev"
echo ""

echo "3. Open in browser:"
echo " http://localhost:5173 (React app)"
echo ""

echo "4. Test APIs (in separate terminal):"
echo " curl http://localhost:3000/api/health"
echo ""

echo "5. Before committing:"
echo " npm run ci # Ensures no broken code"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "💾 USEFUL FILES & DOCS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Main Documentation:"
echo " • /docs/RUNNING_PROJECT.md - Detailed guide"
echo " • /docs/PLANNING/plan.md - Roadmap"
echo " • /docs/SECURITY.md - Security details"
echo " • /docs/PHASE_1_TASKS_8-12_COMPLETE.md - Latest progress"
echo ""

echo "Key Source Files:"
echo " • /packages/client/src/api/ - HTTP client & React Query"
echo " • /packages/client/src/stores/ - Zustand state stores"
echo " • /packages/server/src/server.ts - Express + Socket.IO"
echo " • /packages/types/src/ipc.ts - Type definitions"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "🎯 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Remaining Phase 1 tasks (13-23):"
echo " □ [13] Server Routes (Upload/Download)"
echo " □ [14] IPC Integration"
echo " □ [15] Transfer Engine"
echo " □ [16] QR Code Generation"
echo " □ [17] UI Components"
echo " □ [18] Error Handling"
echo " □ [19-23] Testing & Final QA"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "Ready to start? Run: npm run dev 🚀"
echo ""
