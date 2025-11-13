# 🎭 Enhanced Playwright-CRX

A powerful Chrome extension for Playwright test automation with advanced features including Self-Healing, Data-Driven Testing, and multi-language code generation.

## 🚀 Features

### Core Features
- ✅ **JWT Authentication** - Secure user authentication with access/refresh tokens
- ✅ **Self-Healing Locators** - Automatically recover from broken selectors
- ✅ **Data-Driven Testing** - CSV/JSON file support for parameterized tests
- ✅ **Multi-Language Export** - TypeScript, Python, Java, C#, Robot Framework
- ✅ **Extension Scripts API** - Custom commands and locator builders
- ✅ **Test Runner** - Real-time WebSocket-based execution
- ✅ **Advanced Debugging** - Breakpoints, step execution, variable inspection
- ✅ **CLI Tool** - Headless execution for CI/CD pipelines

### Advanced Features
- 🔄 Intelligent locator fallback (ID → CSS → XPath → TestID)
- 📊 CSV/JSON data binding with `loadVars`/`endLoadVars`
- 🔌 Extensible plugin system
- 📝 Script versioning and history
- 📈 Test analytics and reporting
- 🎯 TestID attribute support
- 💾 PostgreSQL-backed storage

## 📦 Repository Structure

```
playwright-crx-enhanced/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── controllers/    # API route controllers
│   │   ├── services/       # Business logic
│   │   │   ├── auth/       # Authentication services
│   │   │   ├── selfHealing/# Self-healing logic
│   │   │   ├── ddt/        # Data-driven testing
│   │   │   ├── extensions/ # Extension script management
│   │   │   ├── scripts/    # Script CRUD
│   │   │   └── testRuns/   # Test execution
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── websocket/      # WebSocket server
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helper functions
│   ├── prisma/             # Database schema & migrations
│   └── tests/              # Backend tests
│
├── extension/              # Chrome Extension
│   ├── src/
│   │   ├── auth/           # Auth manager
│   │   ├── selfHealing/    # Self-healing client
│   │   ├── ddt/            # DDT engine
│   │   ├── extensions/     # Extension script executor
│   │   ├── codeGenerator/  # Multi-language export
│   │   ├── debugger/       # Debugging tools
│   │   ├── components/     # React UI components
│   │   ├── services/       # API client
│   │   └── utils/          # Helper functions
│   └── public/             # Manifest, icons
│
├── cli/                    # Command-line tool
│   └── src/                # CLI implementation
│
├── .github/workflows/      # CI/CD pipelines
├── docker/                 # Docker configurations
├── postman/                # Postman collection
└── docs/                   # Documentation

```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken + bcrypt)
- **WebSocket**: ws
- **Language**: TypeScript

### Extension
- **Framework**: React + TypeScript
- **Base**: playwright-crx
- **State**: Zustand
- **Styling**: Tailwind CSS
- **Build**: Webpack

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Testing**: Jest + Playwright

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Docker (optional)

### Option 1: Local Development

#### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

#### 2. Extension Setup
```bash
cd extension

# Install dependencies
npm install

# Build extension
npm run build

# Load unpacked extension in Chrome
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select extension/dist folder
```

#### 3. CLI Setup
```bash
cd cli

# Install globally
npm install -g .

# Run tests
pw-crx run test-suite.html
```

### Option 2: Docker Setup

```bash
# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📚 Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Self-Healing Guide](./docs/SELF_HEALING.md)
- [Data-Driven Testing](./docs/DDT.md)
- [Extension Scripts API](./docs/EXTENSION_SCRIPTS.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Extension Tests
```bash
cd extension
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout

### Scripts
- `GET /api/scripts` - List all scripts
- `POST /api/scripts` - Create script
- `GET /api/scripts/:id` - Get script by ID
- `PUT /api/scripts/:id` - Update script
- `DELETE /api/scripts/:id` - Delete script

### Self-Healing
- `POST /api/self-healing/record-failure` - Record locator failure
- `POST /api/self-healing/record-success` - Record locator success
- `GET /api/self-healing/suggestions/:scriptId` - Get suggestions
- `PUT /api/self-healing/approve/:id` - Approve suggestion

### Data-Driven Testing
- `POST /api/test-data/upload` - Upload CSV/JSON
- `GET /api/test-data/files/:scriptId` - List data files
- `GET /api/test-data/rows/:fileId` - Get data rows
- `DELETE /api/test-data/:fileId` - Delete data file

### Test Execution
- `POST /api/scripts/:id/execute` - Execute script
- `GET /api/test-runs/:id` - Get test run details
- `WS /ws` - WebSocket for real-time execution

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/playwright_crx
JWT_ACCESS_SECRET=your-access-secret-change-this
JWT_REFRESH_SECRET=your-refresh-secret-change-this
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=chrome-extension://your-extension-id
```

#### Extension
Update `extension/src/config.ts`:
```typescript
export const config = {
  apiBaseUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000/ws'
};
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

Apache License 2.0 - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) - Browser automation library
- [playwright-crx](https://github.com/ruifigueira/playwright-crx) - Base extension
- [Katalon Recorder](https://github.com/katalon-studio/katalon-recorder) - Feature inspiration

## 📞 Support

- 📧 Email: support@example.com
- 💬 Discord: [Join our server](https://discord.gg/example)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/playwright-crx-enhanced/issues)

## 🗺️ Roadmap

- [ ] Visual regression testing
- [ ] AI-powered test generation
- [ ] Mobile testing support
- [ ] Cloud test execution
- [ ] Team collaboration features
- [ ] Performance testing integration

---

Made with ❤️ by the Playwright-CRX Enhanced team
