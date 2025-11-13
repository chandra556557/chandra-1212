# Self-Healing Architecture Diagram

## Complete System Architecture

```mermaid
graph TB
    subgraph User Interface
        A[Extension Popup]
        B[Test Executor Panel]
        C[Self-Healing Panel]
    end

    subgraph Test Execution Layer
        D[testExecutor.ts]
        E[testExecutorUI.tsx]
        F[apiService.ts]
    end

    subgraph Integration Layer
        G[realDataIntegration.ts]
        H[Event Bus]
    end

    subgraph Self-Healing Core
        I[selfHealingService.ts]
        J[aiSelfHealingService.ts]
        K[selfHealingUI.tsx]
    end

    subgraph Storage Layer
        L[Chrome Storage]
        M[Backend API]
    end

    A -->|Open Test Executor| B
    A -->|Open Self-Healing| C
    
    B -->|Start Test| E
    E -->|Execute| D
    D -->|API Call| F
    F -->|HTTP Request| M
    
    D -->|Test Started Event| H
    D -->|Locator Failed Event| H
    D -->|Test Completed Event| H
    
    H -->|Dispatch| G
    G -->|Process Failure| I
    G -->|AI Enhancement| J
    
    I -->|Find Alternatives| I
    J -->|Predict Success| I
    I -->|Store Suggestion| L
    
    L -->|Load Suggestions| K
    C -->|Display| K
    K -->|User Action| I
    I -->|Update Storage| L
```

## Event Flow Diagram

```mermaid
sequenceDiagram
    participant User
    participant TestExecutorUI
    participant TestExecutor
    participant RealDataInt
    participant SelfHealing
    participant Storage
    participant UI

    User->>TestExecutorUI: Click "Run Test"
    TestExecutorUI->>RealDataInt: startListening()
    TestExecutorUI->>TestExecutor: executeTest(scriptId)
    
    TestExecutor->>TestExecutor: Call Backend API
    TestExecutor->>RealDataInt: Event: testExecutionStarted
    RealDataInt->>RealDataInt: Track execution
    
    Note over TestExecutor: Test runs...
    
    alt Test Fails
        TestExecutor->>TestExecutor: Detect error with locator
        TestExecutor->>RealDataInt: Event: locatorFailed
        RealDataInt->>SelfHealing: recordFailure()
        SelfHealing->>SelfHealing: findAlternativeLocator()
        SelfHealing->>SelfHealing: calculateConfidence()
        SelfHealing->>Storage: Save suggestion
        Storage-->>SelfHealing: Saved
    end
    
    TestExecutor->>RealDataInt: Event: testExecutionCompleted
    RealDataInt->>RealDataInt: Process failures
    
    User->>UI: Click "Heal" button
    UI->>Storage: Load suggestions
    Storage-->>UI: Return suggestions
    UI->>User: Display suggestions
    
    User->>UI: Approve/Reject
    UI->>SelfHealing: approveSuggestion(id)
    SelfHealing->>Storage: Update status
    Storage-->>SelfHealing: Updated
    SelfHealing-->>UI: Success
```

## Data Flow

```mermaid
flowchart LR
    A[Test Fails] --> B{Error Contains<br/>Locator?}
    B -->|Yes| C[Extract Locator]
    B -->|No| D[Generic Error]
    
    C --> E[Dispatch Event]
    E --> F[realDataIntegration<br/>Captures]
    F --> G[selfHealingService<br/>Analyzes]
    
    G --> H{AI Enabled?}
    H -->|Yes| I[aiSelfHealingService<br/>Enhanced Analysis]
    H -->|No| J[Traditional Analysis]
    
    I --> K[Find Alternatives]
    J --> K
    
    K --> L[Calculate Confidence]
    L --> M[Create Suggestion]
    M --> N[Store in Chrome Storage]
    N --> O[Display in UI]
    
    O --> P{User Action}
    P -->|Approve| Q[Increase Confidence]
    P -->|Reject| R[Mark Rejected]
    
    Q --> S[Track Success]
    R --> T[Track Rejection]
```

## Component Interaction

```mermaid
graph LR
    subgraph Extension Core
        A[testExecutor]
        B[testExecutorUI]
    end
    
    subgraph Integration
        C[realDataIntegration]
        D[Event System]
    end
    
    subgraph Self-Healing
        E[selfHealingService]
        F[aiSelfHealingService]
        G[selfHealingUI]
    end
    
    subgraph Storage
        H[Chrome Storage]
        I[Backend API]
    end
    
    A -->|Events| D
    B -->|Start/Stop| C
    D -->|Notify| C
    C -->|Process| E
    C -->|AI Enhance| F
    E -->|Save| H
    F -->|Learn| I
    H -->|Load| G
    G -->|Actions| E
```

## Locator Healing Process

```mermaid
flowchart TD
    Start[Locator Fails] --> Extract[Extract Locator Info]
    Extract --> Check[Check Unstable Patterns]
    
    Check --> Pattern1{Long Numeric ID?}
    Pattern1 -->|Yes| Flag1[Flag as Unstable]
    Pattern1 -->|No| Pattern2{CSS Module?}
    
    Pattern2 -->|Yes| Flag2[Flag as Unstable]
    Pattern2 -->|No| Pattern3{Dynamic Timestamp?}
    
    Pattern3 -->|Yes| Flag3[Flag as Unstable]
    Pattern3 -->|No| Analyze[Analyze Element]
    
    Flag1 --> Analyze
    Flag2 --> Analyze
    Flag3 --> Analyze
    
    Analyze --> Generate[Generate Alternatives]
    Generate --> Priority[Apply Priority Strategy]
    
    Priority --> Alt1[1. data-testid]
    Priority --> Alt2[2. id]
    Priority --> Alt3[3. aria-label]
    Priority --> Alt4[4. role]
    Priority --> Alt5[5. Other...]
    
    Alt1 --> Score[Calculate Scores]
    Alt2 --> Score
    Alt3 --> Score
    Alt4 --> Score
    Alt5 --> Score
    
    Score --> AI{AI Enabled?}
    AI -->|Yes| AIScore[AI Confidence Score]
    AI -->|No| TradScore[Traditional Score]
    
    AIScore --> Best[Select Best Alternative]
    TradScore --> Best
    
    Best --> Create[Create Suggestion]
    Create --> Save[Save to Storage]
    Save --> End[Show in UI]
```

## Storage Structure

```mermaid
graph TB
    subgraph Chrome Storage
        A[healing_suggestions_<br/>scriptId]
        B[locator_strategies]
        C[ai_healing_config]
    end
    
    subgraph Suggestion Object
        D[id: string]
        E[brokenLocator: string]
        F[validLocator: string]
        G[confidence: number]
        H[status: pending/approved/rejected]
        I[aiEnhanced: boolean]
        J[timestamp: Date]
    end
    
    A --> D
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    
    subgraph Strategy Object
        K[type: string]
        L[priority: number]
        M[stability: number]
    end
    
    B --> K
    B --> L
    B --> M
```

## AI Enhancement Flow

```mermaid
flowchart LR
    A[Element Info] --> B[Extract Features]
    B --> C{Features}
    
    C --> D[hasNumericId]
    C --> E[hasCssModuleClass]
    C --> F[hasTimestamp]
    C --> G[hasAriaLabel]
    C --> H[hasDataTestId]
    
    D --> I[AI Prediction Model]
    E --> I
    F --> I
    G --> I
    H --> I
    
    I --> J[Confidence Score]
    I --> K[Alternative Suggestions]
    I --> L[Visual Similarity]
    
    J --> M[Combine with<br/>Traditional Score]
    K --> M
    L --> M
    
    M --> N[Final Confidence]
    N --> O[Create Enhanced<br/>Suggestion]
```

## Integration Points

```mermaid
graph TB
    A[testExecutor.ts<br/>Line ~70] -->|dispatchTestStarted| B[Event Bus]
    C[testExecutor.ts<br/>Line ~230] -->|dispatchLocatorFailure| B
    D[testExecutor.ts<br/>Line ~215] -->|dispatchTestCompleted| B
    
    B --> E[realDataIntegration.ts<br/>Line ~60]
    E --> F[handleTestStart]
    E --> G[handleLocatorFailure]
    E --> H[handleTestComplete]
    
    G --> I[selfHealingService.ts<br/>Line ~140]
    I --> J[recordFailure]
    I --> K[findAlternativeLocator]
    
    K --> L[aiSelfHealingService.ts<br/>Line ~200]
    L --> M[predictLocatorSuccess]
    L --> N[autoHealLocator]
    
    M --> O[Chrome Storage]
    N --> O
    
    O --> P[selfHealingUI.tsx<br/>Line ~45]
    P --> Q[Display Suggestions]
```

## State Management

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Listening: Test Executor Opens
    Listening --> Capturing: Test Starts
    Capturing --> Analyzing: Locator Fails
    Analyzing --> Suggesting: Alternative Found
    Suggesting --> Pending: Suggestion Created
    
    Pending --> Approved: User Approves
    Pending --> Rejected: User Rejects
    
    Approved --> Applied: Auto-Apply
    Approved --> Tracking: Manual Apply
    
    Rejected --> Archived: Cleanup
    
    Applied --> Success: Test Passes
    Applied --> Failed: Test Fails
    
    Success --> Learning: Update AI Model
    Failed --> Analyzing: Try Again
    
    Listening --> Idle: Test Executor Closes
    
    Archived --> [*]
    Learning --> [*]
```

## File Dependencies

```mermaid
graph TD
    A[testExecutor.ts] --> B[realDataIntegration.ts]
    C[testExecutorUI.tsx] --> B
    
    B --> D[selfHealing.ts]
    B --> E[aiSelfHealingService.ts]
    
    D --> F[Chrome Storage API]
    E --> F
    
    G[selfHealingUI.tsx] --> D
    G --> F
    
    H[crxRecorder.tsx] --> G
    H --> C
```

## Summary

### Key Components:
1. **testExecutor.ts** - Dispatches events when tests fail
2. **testExecutorUI.tsx** - Starts/stops listening for events
3. **realDataIntegration.ts** - Captures events and triggers healing
4. **selfHealingService.ts** - Core healing logic
5. **aiSelfHealingService.ts** - AI enhancement layer
6. **selfHealingUI.tsx** - User interface for suggestions
7. **Chrome Storage** - Persistence layer

### Event Types:
- `testExecutionStarted` - Test begins
- `locatorFailed` - Locator fails with error
- `locatorHealed` - Healing successful
- `testExecutionCompleted` - Test finishes

### Data Flow:
Test Fails → Extract Locator → Dispatch Event → Capture → Analyze → Find Alternative → Calculate Confidence → Create Suggestion → Store → Display → User Action → Update

### Storage Keys:
- `healing_suggestions_<scriptId>` - Suggestions per script
- `locator_strategies` - Prioritized strategies
- `ai_healing_config` - AI configuration

---

**Architecture Status:** 🟢 **Complete and Operational**
