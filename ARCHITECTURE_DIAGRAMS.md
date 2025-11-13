# 🏗️ PLAYWRIGHT-CRX ENHANCED - ARCHITECTURE DIAGRAMS

**Version**: 1.0.0
**Date**: 2025-10-23

---

## 📊 1. SYSTEM ARCHITECTURE OVERVIEW

```mermaid
graph TB
    subgraph Browser["Chrome Browser"]
        Extension["Playwright-CRX Extension"]
        Recorder["Test Recorder UI"]
        SelfHealing["Self-Healing UI"]
        DDT["Data-Driven Testing UI"]
        Debugger["Debugger UI"]
        Executor["Test Executor UI"]
    end

    subgraph Backend["Backend Server (Node.js/Express)"]
        API["REST API :3000"]
        WebSocket["WebSocket Server :3000/ws"]
        Auth["Authentication Service"]
        TestRunner["Test Execution Engine"]
    end

    subgraph Database["PostgreSQL Database"]
        Users["Users Table"]
        Scripts["Scripts Table"]
        TestRuns["Test Runs Table"]
        SHLocators["Self-Healing Locators"]
        DataFiles["Test Data Files"]
    end

    Extension --> Recorder
    Extension --> SelfHealing
    Extension --> DDT
    Extension --> Debugger
    Extension --> Executor

    Recorder -->|HTTP/HTTPS| API
    Executor -->|HTTP/HTTPS| API
    Executor -->|WebSocket| WebSocket
    SelfHealing -->|HTTP/HTTPS| API
    DDT -->|HTTP/HTTPS| API

    API --> Auth
    API --> TestRunner
    WebSocket --> TestRunner

    Auth --> Users
    TestRunner --> Scripts
    TestRunner --> TestRuns
    SelfHealing --> SHLocators
    DDT --> DataFiles
```

---

## 🔄 2. DATA FLOW DIAGRAM

```mermaid
sequenceDiagram
    participant User
    participant Extension
    participant API
    participant Database
    participant WebSocket

    User->>Extension: Record Test Actions
    Extension->>Extension: Generate Code
    User->>Extension: Save Script
    Extension->>API: POST /api/scripts
    API->>Database: INSERT script
    Database-->>API: Script ID
    API-->>Extension: Success

    User->>Extension: Execute Test
    Extension->>API: POST /api/test-runs
    API->>Database: CREATE test run
    API->>WebSocket: Start execution
    WebSocket-->>Extension: Progress updates
    WebSocket-->>Extension: Log messages
    WebSocket-->>Extension: Completion status
    API->>Database: UPDATE test run
```

---

## 🧩 3. COMPONENT ARCHITECTURE

```mermaid
graph LR
    subgraph Extension["Chrome Extension"]
        UI["React UI Components"]
        Services["Service Layer"]
        Storage["Chrome Storage"]
    end

    subgraph Services_Detail["Services"]
        API_Service["API Service"]
        DDT_Service["DDT Service"]
        Test_Executor["Test Executor"]
        Code_Generator["Code Generator"]
    end

    subgraph Backend_Detail["Backend Services"]
        Controllers["Controllers"]
        Routes["Routes"]
        Middleware["Middleware"]
        Prisma["Prisma ORM"]
    end

    UI --> Services
    Services --> API_Service
    Services --> DDT_Service
    Services --> Test_Executor
    Services --> Code_Generator

    API_Service -->|REST API| Controllers
    Test_Executor -->|WebSocket| Backend_Detail

    Controllers --> Routes
    Routes --> Middleware
    Middleware --> Prisma
    Prisma --> Database[(PostgreSQL)]
```

---

## 🔐 4. AUTHENTICATION FLOW

```mermaid
sequenceDiagram
    participant User
    participant Extension
    participant Auth_API
    participant Database
    participant Storage

    User->>Extension: Enter Credentials
    Extension->>Auth_API: POST /api/auth/login
    Auth_API->>Database: Verify User
    Database-->>Auth_API: User Data
    Auth_API->>Auth_API: Generate JWT Tokens
    Auth_API-->>Extension: Access + Refresh Tokens
    Extension->>Storage: Save Tokens
    Storage-->>Extension: Tokens Saved
    Extension-->>User: Login Success

    Note over Extension,Auth_API: Subsequent Requests
    Extension->>Auth_API: API Request + Access Token
    Auth_API->>Auth_API: Verify JWT
    Auth_API-->>Extension: Protected Resource
```

---

## 🧪 5. TEST EXECUTION FLOW

```mermaid
graph TD
    Start[User Clicks Execute] --> LoadScript[Load Script from DB]
    LoadScript --> CreateRun[Create Test Run]
    CreateRun --> InitWS[Initialize WebSocket]
    InitWS --> ParseSteps[Parse Test Steps]

    ParseSteps --> ExecuteStep[Execute Step]
    ExecuteStep --> StepSuccess{Step Success?}

    StepSuccess -->|Yes| SendProgress[Send Progress Update]
    StepSuccess -->|No| TrySelfHeal{Self-Healing Enabled?}

    TrySelfHeal -->|Yes| FindLocator[Find Alternative Locator]
    FindLocator --> LocatorFound{Found?}
    LocatorFound -->|Yes| SaveHealed[Save Healed Locator]
    LocatorFound -->|No| LogError[Log Error]
    TrySelfHeal -->|No| LogError

    SaveHealed --> SendProgress
    LogError --> SendProgress

    SendProgress --> MoreSteps{More Steps?}
    MoreSteps -->|Yes| ExecuteStep
    MoreSteps -->|No| Complete[Mark Run Complete]
    Complete --> SaveResults[Save Results to DB]
    SaveResults --> End[Notify User]
```

---

## 📦 6. DATABASE SCHEMA RELATIONSHIPS

```mermaid
erDiagram
    User ||--o{ Project : owns
    User ||--o{ Script : creates
    User ||--o{ TestRun : executes
    User ||--o{ RefreshToken : has
    User ||--o{ TestDataFile : uploads

    Project ||--o{ Script : contains

    Script ||--o{ TestRun : executes
    Script ||--o{ SelfHealingLocator : has
    Script ||--o{ TestDataFile : uses
    Script ||--o{ Variable : defines
    Script ||--o{ Breakpoint : has

    TestRun ||--o{ TestStep : contains

    TestDataFile ||--o{ TestDataRow : contains

    User {
        string id PK
        string email
        string password
        string name
        datetime createdAt
    }

    Script {
        string id PK
        string name
        string language
        text code
        string userId FK
        string projectId FK
        boolean selfHealingEnabled
    }

    TestRun {
        string id PK
        string scriptId FK
        string userId FK
        string status
        int duration
        datetime startedAt
    }

    SelfHealingLocator {
        string id PK
        string scriptId FK
        text brokenLocator
        text validLocator
        string status
        float confidence
    }
```

---

## 🌐 7. API ENDPOINT ARCHITECTURE

```mermaid
graph TB
    Client[Extension/Frontend]

    subgraph API_Routes["API Routes /api"]
        Auth["/auth"]
        Scripts["/scripts"]
        Projects["/projects"]
        TestRuns["/test-runs"]
        SelfHealing["/self-healing"]
        TestData["/test-data"]
        Extensions["/extensions"]
    end

    subgraph Auth_Endpoints["/auth endpoints"]
        Register[POST /register]
        Login[POST /login]
        Refresh[POST /refresh]
        Logout[POST /logout]
        Profile[GET /profile]
    end

    subgraph Script_Endpoints["/scripts endpoints"]
        GetScripts[GET /]
        GetScript[GET /:id]
        CreateScript[POST /]
        UpdateScript[PUT /:id]
        DeleteScript[DELETE /:id]
    end

    subgraph TestRun_Endpoints["/test-runs endpoints"]
        CreateRun[POST /]
        GetRuns[GET /]
        GetRun[GET /:id]
        CancelRun[POST /:id/cancel]
    end

    Client --> API_Routes
    Auth --> Auth_Endpoints
    Scripts --> Script_Endpoints
    TestRuns --> TestRun_Endpoints
```

---

## 🔄 8. SELF-HEALING MECHANISM FLOW

```mermaid
graph TD
    Start[Element Not Found] --> CheckEnabled{Self-Healing Enabled?}
    CheckEnabled -->|No| Fail[Test Fails]
    CheckEnabled -->|Yes| FindAlternatives[Find Alternative Locators]

    FindAlternatives --> Strategies[Try Locator Strategies]
    Strategies --> TestID[1. Test ID]
    Strategies --> Text[2. Text Content]
    Strategies --> ARIA[3. ARIA Labels]
    Strategies --> CSS[4. CSS Selectors]
    Strategies --> XPath[5. XPath]

    TestID --> Found{Found?}
    Text --> Found
    ARIA --> Found
    CSS --> Found
    XPath --> Found

    Found -->|Yes| CalculateConfidence[Calculate Confidence Score]
    Found -->|No| NextStrategy{More Strategies?}

    NextStrategy -->|Yes| Strategies
    NextStrategy -->|No| Fail

    CalculateConfidence --> HighConfidence{Confidence > 80%?}
    HighConfidence -->|Yes| UseLocator[Use Locator]
    HighConfidence -->|No| RequestApproval[Request User Approval]

    RequestApproval --> Approved{Approved?}
    Approved -->|Yes| SaveToDB[Save to Database]
    Approved -->|No| Fail

    UseLocator --> SaveToDB
    SaveToDB --> ContinueTest[Continue Test Execution]
```

---

## 📁 9. PROJECT STRUCTURE

```mermaid
graph TD
    Root[play-crx-feature-test-execution]

    Root --> Src[src/]
    Root --> Examples[examples/]
    Root --> Tests[tests/]
    Root --> Enhanced[playwright-crx-enhanced/]
    Root --> Playwright[playwright/]

    Src --> Client[client/]
    Src --> Server[server/]
    Src --> Protocol[protocol/]
    Src --> Types[types/]

    Examples --> RecorderCRX[recorder-crx/]
    Examples --> TodoMVC[todomvc-crx/]

    RecorderCRX --> RecorderSrc[src/]
    RecorderSrc --> CrxRecorder[crxRecorder.tsx]
    RecorderSrc --> TestExecutorUI[testExecutorUI.tsx]
    RecorderSrc --> SelfHealingUI[selfHealingUI.tsx]
    RecorderSrc --> DDTUI[ddtUI.tsx]
    RecorderSrc --> DebuggerUI[debuggerUI.tsx]
    RecorderSrc --> APIService[apiService.ts]
    RecorderSrc --> CodeGenerator[codeGenerator.ts]

    Enhanced --> Backend[backend/]
    Enhanced --> Frontend[frontend/]

    Backend --> BackendSrc[src/]
    Backend --> Prisma[prisma/]

    BackendSrc --> Controllers[controllers/]
    BackendSrc --> Routes[routes/]
    BackendSrc --> Middleware[middleware/]
    BackendSrc --> Services[services/]
    BackendSrc --> WebSocketDir[websocket/]

    Prisma --> Schema[schema.prisma]
    Prisma --> Migrations[migrations/]
    Prisma --> Seed[seed.ts]
```

---

## 🚀 10. DEPLOYMENT ARCHITECTURE

```mermaid
graph TB
    subgraph Development["Development Environment"]
        DevBrowser[Chrome Browser]
        DevExtension[Extension Dev Build]
        DevBackend[Backend :3000]
        DevDB[(PostgreSQL :5433)]
    end

    subgraph Production["Production Environment"]
        UserBrowser[Chrome Browser]
        ProdExtension[Extension Published]
        LoadBalancer[Load Balancer]

        subgraph BackendCluster["Backend Cluster"]
            API1[API Server 1]
            API2[API Server 2]
            API3[API Server 3]
        end

        ProdDB[(PostgreSQL Cluster)]
        Redis[(Redis Cache)]
    end

    DevExtension -->|Hot Reload| DevBrowser
    DevExtension -->|API Calls| DevBackend
    DevBackend -->|Prisma| DevDB

    ProdExtension --> UserBrowser
    UserBrowser -->|HTTPS| LoadBalancer
    LoadBalancer --> API1
    LoadBalancer --> API2
    LoadBalancer --> API3

    API1 --> ProdDB
    API2 --> ProdDB
    API3 --> ProdDB

    API1 --> Redis
    API2 --> Redis
    API3 --> Redis
```

---

## 🔧 11. DATA-DRIVEN TESTING FLOW

```mermaid
sequenceDiagram
    participant User
    participant Extension
    participant DDT_Service
    participant API
    participant Database

    User->>Extension: Upload CSV/JSON File
    Extension->>DDT_Service: Parse File
    DDT_Service->>DDT_Service: Validate Data
    DDT_Service->>API: POST /api/test-data
    API->>Database: Save File + Rows
    Database-->>API: File ID
    API-->>Extension: Upload Success

    User->>Extension: Select Data File
    User->>Extension: Execute DDT
    Extension->>API: POST /api/test-runs (with fileId)

    loop For Each Row
        API->>Database: Get Row Data
        Database-->>API: Row Variables
        API->>API: Replace Variables in Script
        API->>API: Execute Test with Data
        API-->>Extension: Progress Update
    end

    API->>Database: Save Aggregated Results
    API-->>Extension: Execution Complete
```

---

## 🎯 12. CODE GENERATION FLOW

```mermaid
graph LR
    UserAction[User Actions in Browser] --> Recorder[Recorder Captures Events]
    Recorder --> Actions[Action Objects]
    Actions --> CodeGen[Code Generator]

    CodeGen --> Language{Select Language}

    Language -->|TypeScript| TSTemplate[TypeScript Template]
    Language -->|JavaScript| JSTemplate[JavaScript Template]
    Language -->|Python| PyTemplate[Python Template]
    Language -->|Java| JavaTemplate[Java Template]
    Language -->|JUnit| JUnitTemplate[JUnit Template]
    Language -->|C#| CSharpTemplate[C# Template]
    Language -->|Robot| RobotTemplate[Robot Framework Template]

    TSTemplate --> GeneratedCode[Generated Test Code]
    JSTemplate --> GeneratedCode
    PyTemplate --> GeneratedCode
    JavaTemplate --> GeneratedCode
    JUnitTemplate --> GeneratedCode
    CSharpTemplate --> GeneratedCode
    RobotTemplate --> GeneratedCode

    GeneratedCode --> Display[Display in Editor]
    Display --> Save[Save to File/Cloud]
```

---

## 🛡️ 13. SECURITY ARCHITECTURE

```mermaid
graph TB
    Client[Client Request]

    Client --> HTTPS[HTTPS Layer]
    HTTPS --> CORS[CORS Validation]
    CORS --> RateLimit[Rate Limiting]
    RateLimit --> Helmet[Security Headers]

    Helmet --> AuthCheck{Requires Auth?}
    AuthCheck -->|No| PublicRoute[Public Route]
    AuthCheck -->|Yes| ValidateJWT[Validate JWT Token]

    ValidateJWT --> TokenValid{Token Valid?}
    TokenValid -->|No| Unauthorized[401 Unauthorized]
    TokenValid -->|Yes| CheckPermission[Check Permissions]

    CheckPermission --> HasPermission{Has Permission?}
    HasPermission -->|No| Forbidden[403 Forbidden]
    HasPermission -->|Yes| Controller[Execute Controller]

    PublicRoute --> Controller

    Controller --> Validation[Input Validation]
    Validation --> Sanitization[Data Sanitization]
    Sanitization --> PrismaORM[Prisma ORM]
    PrismaORM --> Database[(Database)]

    Database --> Response[Generate Response]
    Response --> Client
```

---

## 📊 14. MONITORING & LOGGING

```mermaid
graph LR
    subgraph Application["Application Layer"]
        Extension[Extension]
        Backend[Backend API]
        Database[(Database)]
    end

    subgraph Logging["Logging System"]
        ExtensionLogs[Extension Logs]
        APILogs[API Logs]
        ErrorLogs[Error Logs]
        AccessLogs[Access Logs]
    end

    subgraph Storage["Log Storage"]
        FileSystem[File System]
        LogFiles[combined.log / error.log]
    end

    Extension -->|POST /api/extensions/logs| ExtensionLogs
    Backend --> APILogs
    Backend --> ErrorLogs
    Backend --> AccessLogs

    ExtensionLogs --> FileSystem
    APILogs --> FileSystem
    ErrorLogs --> FileSystem
    AccessLogs --> FileSystem

    FileSystem --> LogFiles
```

---

## 🎨 15. UI COMPONENT HIERARCHY

```mermaid
graph TD
    CrxRecorder[CrxRecorder Main Component]

    CrxRecorder --> Toolbar[Toolbar]
    CrxRecorder --> CodePanel[Code Panel]
    CrxRecorder --> EnhancedFeatures[Enhanced Features Panel]

    Toolbar --> RecordBtn[Record Button]
    Toolbar --> StopBtn[Stop Button]
    Toolbar --> LanguageSelect[Language Selector]
    Toolbar --> FeatureButtons[Feature Buttons]

    FeatureButtons --> TestExecutorBtn[Test Executor]
    FeatureButtons --> DebuggerBtn[Debugger]
    FeatureButtons --> SelfHealingBtn[Self-Healing]
    FeatureButtons --> DDTBtn[Data-Driven Testing]

    EnhancedFeatures --> TestExecutorUI[Test Executor UI]
    EnhancedFeatures --> DebuggerUI[Debugger UI]
    EnhancedFeatures --> SelfHealingUI[Self-Healing UI]
    EnhancedFeatures --> DDTUI[DDT UI]

    TestExecutorUI --> AuthStatus[Auth Status]
    TestExecutorUI --> LoginModal[Login Modal]
    TestExecutorUI --> ScriptLibrary[Script Library]
    TestExecutorUI --> ExecutionControls[Execution Controls]
    TestExecutorUI --> ProgressDisplay[Progress Display]
    TestExecutorUI --> LogsPanel[Logs Panel]
```

---

## 🎯 LEGEND

### Component Types
- **Rectangle**: Service/Component
- **Cylinder**: Database/Storage
- **Diamond**: Decision Point
- **Parallelogram**: Input/Output
- **Circle**: Start/End Point

### Connection Types
- **Solid Line**: Direct Connection
- **Dashed Line**: Async/Event-based
- **Arrow**: Data Flow Direction
- **Bidirectional**: Two-way Communication

---

## 📝 NOTES

1. **All diagrams are interactive** - View in Markdown preview supporting Mermaid
2. **Backend runs on port 3000** - Configurable via .env
3. **WebSocket uses same port** - Path: `/ws`
4. **Database connection** - Via Prisma ORM
5. **Authentication** - JWT-based with refresh tokens
6. **Real-time updates** - Via WebSocket for test execution

---

**Generated**: 2025-10-23
**Version**: 1.0.0
**Status**: Production Ready ✅
