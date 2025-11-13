# ☕ JUnit Testing Guide for Playwright-CRX

## 🎯 Overview

The **JUnit** option (`java-junit`) in the target library allows you to generate **Java-based Playwright tests using JUnit 5** framework. This is perfect for Java developers who want to integrate Playwright browser automation with their existing JUnit test suites.

---

## 📋 What is JUnit?

**JUnit** is the most popular testing framework for Java applications. JUnit 5 (Jupiter) provides:
- Modern annotation-based testing
- Lifecycle management (`@BeforeAll`, `@BeforeEach`, etc.)
- Rich assertions
- Test discovery and execution
- IDE integration (IntelliJ IDEA, Eclipse, VS Code)
- Build tool integration (Maven, Gradle)

---

## 🚀 How to Use JUnit in Playwright-CRX

### **Step 1: Select JUnit as Target Language**

#### **Option A: Via Preferences (UI)**

1. Open the Playwright Recorder extension
2. Click the **Settings (⚙️)** icon
3. In "Default language" dropdown, select:
   ```
   Java → JUnit
   ```
4. Click **Save**
5. All new recordings will generate JUnit code!

#### **Option B: During Recording**

1. Start recording (`Alt + Shift + R`)
2. In the code panel, select language dropdown
3. Choose **`java-junit`**
4. Code updates to JUnit format automatically

---

### **Step 2: Record Your Test**

1. Navigate to your web application
2. Perform actions (click, type, navigate)
3. Add assertions (right-click → Assert)
4. The recorder generates JUnit test code

---

### **Step 3: Generated JUnit Code**

Here's what the extension generates:

```java
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.*;
import org.junit.jupiter.api.*;
import static com.microsoft.playwright.assertions.PlaywrightAssertions.*;
import static org.junit.jupiter.api.Assertions.*;

public class TestExample {
  private static Playwright playwright;
  private static Browser browser;
  private BrowserContext context;
  private Page page;

  @BeforeAll
  static void setUpClass() {
    playwright = Playwright.create();
    browser = playwright.chromium().launch();
  }

  @AfterAll
  static void tearDownClass() {
    if (browser != null) {
      browser.close();
    }
    if (playwright != null) {
      playwright.close();
    }
  }

  @BeforeEach
  void setUp() {
    context = browser.newContext();
    page = context.newPage();
  }

  @AfterEach
  void tearDown() {
    if (context != null) {
      context.close();
    }
  }

  @Test
  void testExample() {
    page.goto("https://demo.playwright.dev/todomvc");
    page.locator("input.new-todo").fill("Buy milk");
    page.locator("input.new-todo").press("Enter");
    assertThat(page.locator(".todo-list li")).hasText("Buy milk");
  }
}
```

---

## 🏗️ Project Setup

### **Step 1: Create Java Project**

#### **Using Maven**

```bash
# Create new Maven project
mvn archetype:generate \
  -DgroupId=com.example \
  -DartifactId=playwright-tests \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false
```

#### **Using Gradle**

```bash
# Initialize Gradle project
gradle init --type java-application
```

---

### **Step 2: Add Dependencies**

#### **Maven (`pom.xml`)**

```xml
<dependencies>
  <!-- Playwright -->
  <dependency>
    <groupId>com.microsoft.playwright</groupId>
    <artifactId>playwright</artifactId>
    <version>1.48.0</version>
  </dependency>

  <!-- JUnit 5 -->
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-api</artifactId>
    <version>5.10.1</version>
    <scope>test</scope>
  </dependency>
  <dependency>
    <groupId>org.junit.jupiter</groupId>
    <artifactId>junit-jupiter-engine</artifactId>
    <version>5.10.1</version>
    <scope>test</scope>
  </dependency>
</dependencies>

<build>
  <plugins>
    <plugin>
      <groupId>org.apache.maven.plugins</groupId>
      <artifactId>maven-surefire-plugin</artifactId>
      <version>3.0.0-M9</version>
    </plugin>
  </plugins>
</build>
```

#### **Gradle (`build.gradle`)**

```gradle
dependencies {
    // Playwright
    testImplementation 'com.microsoft.playwright:playwright:1.48.0'

    // JUnit 5
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.10.1'
    testRuntimeOnly 'org.junit.jupiter:junit-jupiter-engine:5.10.1'
}

test {
    useJUnitPlatform()
}
```

---

### **Step 3: Install Playwright Browsers**

```bash
# Install Playwright browsers
mvn exec:java -e -D exec.mainClass=com.microsoft.playwright.CLI -D exec.args="install"

# Or with Gradle
gradle installPlaywright
```

---

### **Step 4: Add Generated Test**

1. Copy the generated code from the recorder
2. Create a new test file: `src/test/java/com/example/TestExample.java`
3. Paste the code
4. Save the file

---

## ▶️ Running JUnit Tests

### **Option 1: Maven**

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=TestExample

# Run specific test method
mvn test -Dtest=TestExample#testExample
```

### **Option 2: Gradle**

```bash
# Run all tests
gradle test

# Run specific test class
gradle test --tests TestExample

# Run specific test method
gradle test --tests TestExample.testExample
```

### **Option 3: IDE**

**IntelliJ IDEA:**
- Right-click on test class → Run 'TestExample'
- Click the green arrow next to `@Test` method
- Use `Ctrl + Shift + F10` to run current test

**Eclipse:**
- Right-click on test class → Run As → JUnit Test
- Click Run button in toolbar

**VS Code:**
- Install "Test Runner for Java" extension
- Click "Run Test" link above `@Test` method

---

## 🎨 JUnit Code Structure Explained

### **Class-Level Setup** (`@BeforeAll`)

```java
@BeforeAll
static void setUpClass() {
  playwright = Playwright.create();
  browser = playwright.chromium().launch();
}
```

- Runs **once** before all tests
- Initializes Playwright and Browser
- Shared across all test methods
- Uses `static` to maintain state

### **Class-Level Teardown** (`@AfterAll`)

```java
@AfterAll
static void tearDownClass() {
  if (browser != null) {
    browser.close();
  }
  if (playwright != null) {
    playwright.close();
  }
}
```

- Runs **once** after all tests
- Closes browser and Playwright
- Cleanup resources

### **Test-Level Setup** (`@BeforeEach`)

```java
@BeforeEach
void setUp() {
  context = browser.newContext();
  page = context.newPage();
}
```

- Runs **before each** test method
- Creates fresh browser context
- Opens new page
- Ensures test isolation

### **Test-Level Teardown** (`@AfterEach`)

```java
@AfterEach
void tearDown() {
  if (context != null) {
    context.close();
  }
}
```

- Runs **after each** test method
- Closes the context
- Cleans up per-test resources

### **Test Method** (`@Test`)

```java
@Test
void testExample() {
  // Your test code here
  page.goto("https://example.com");
  assertThat(page.locator("h1")).hasText("Example");
}
```

- Actual test logic
- Can have multiple `@Test` methods
- Each runs independently

---

## 📚 Advanced JUnit Features

### **1. Multiple Tests**

```java
public class TestExample {
  // ... setup code ...

  @Test
  void testLogin() {
    page.goto("https://example.com/login");
    page.locator("#username").fill("admin");
    page.locator("#password").fill("password");
    page.locator("button[type='submit']").click();
    assertThat(page).hasURL("https://example.com/dashboard");
  }

  @Test
  void testSearch() {
    page.goto("https://example.com");
    page.locator("input[name='search']").fill("playwright");
    page.locator("button.search").click();
    assertThat(page.locator(".results")).containsText("playwright");
  }

  @Test
  void testCheckout() {
    page.goto("https://example.com/products");
    page.locator(".add-to-cart").first().click();
    page.locator(".cart-icon").click();
    assertThat(page.locator(".cart-items")).not().toBeEmpty();
  }
}
```

### **2. Test Naming with `@DisplayName`**

```java
import org.junit.jupiter.api.DisplayName;

@Test
@DisplayName("User should be able to login with valid credentials")
void testLogin() {
  // test code
}

@Test
@DisplayName("Search should return relevant results")
void testSearch() {
  // test code
}
```

### **3. Parameterized Tests**

```java
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

@ParameterizedTest
@ValueSource(strings = {"playwright", "selenium", "cypress"})
void testSearchMultipleTerms(String searchTerm) {
  page.goto("https://example.com");
  page.locator("input[name='search']").fill(searchTerm);
  page.locator("button.search").click();
  assertThat(page.locator(".results")).containsText(searchTerm);
}
```

### **4. Conditional Tests**

```java
import org.junit.jupiter.api.condition.*;

@Test
@EnabledOnOs(OS.WINDOWS)
void testOnWindows() {
  // Only runs on Windows
}

@Test
@DisabledIfEnvironmentVariable(named = "CI", matches = "true")
void testNotOnCI() {
  // Skipped on CI
}
```

### **5. Test Execution Order**

```java
import org.junit.jupiter.api.TestMethodOrder;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class TestExample {

  @Test
  @Order(1)
  void testFirst() { }

  @Test
  @Order(2)
  void testSecond() { }

  @Test
  @Order(3)
  void testThird() { }
}
```

---

## 🔧 Configuration Options

### **Browser Configuration**

```java
@BeforeAll
static void setUpClass() {
  playwright = Playwright.create();

  // Launch with options
  BrowserType.LaunchOptions options = new BrowserType.LaunchOptions()
    .setHeadless(false)        // Show browser
    .setSlowMo(1000);          // Slow down by 1 second

  browser = playwright.chromium().launch(options);
}
```

### **Context Configuration**

```java
@BeforeEach
void setUp() {
  // Browser context with options
  Browser.NewContextOptions options = new Browser.NewContextOptions()
    .setViewportSize(1920, 1080)
    .setUserAgent("Custom User Agent")
    .setLocale("en-US")
    .setTimezoneId("America/New_York");

  context = browser.newContext(options);
  page = context.newPage();
}
```

### **Video Recording**

```java
@BeforeEach
void setUp() {
  Browser.NewContextOptions options = new Browser.NewContextOptions()
    .setRecordVideoDir(Paths.get("videos/"))
    .setRecordVideoSize(1280, 720);

  context = browser.newContext(options);
  page = context.newPage();
}
```

---

## 🎯 Comparison: JUnit vs Java Library

### **Java Library** (`java`)
```java
// Simple standalone program
public class TestExample {
  public static void main(String[] args) {
    // Single execution
    // Manual setup/teardown
    // No test framework
  }
}
```

### **JUnit** (`java-junit`)
```java
// Test framework integration
public class TestExample {
  @BeforeAll static void setUpClass() { }
  @BeforeEach void setUp() { }
  @Test void testExample() { }
  @AfterEach void tearDown() { }
  @AfterAll static void tearDownClass() { }

  // Multiple tests
  // Automatic lifecycle management
  // Assertions and reporting
  // IDE/CI integration
}
```

**Use JUnit when:**
- ✅ Building a test suite
- ✅ Need test isolation
- ✅ Want IDE integration
- ✅ Using CI/CD pipelines
- ✅ Multiple test cases
- ✅ Team collaboration

**Use Java Library when:**
- ✅ One-off automation scripts
- ✅ Quick prototyping
- ✅ Simple demonstrations
- ✅ No test framework needed

---

## 📊 Example: Complete Test Suite

```java
import com.microsoft.playwright.*;
import com.microsoft.playwright.options.*;
import org.junit.jupiter.api.*;
import static com.microsoft.playwright.assertions.PlaywrightAssertions.*;

@DisplayName("TodoMVC Application Tests")
public class TodoMVCTest {
  private static Playwright playwright;
  private static Browser browser;
  private BrowserContext context;
  private Page page;

  @BeforeAll
  static void setUpClass() {
    playwright = Playwright.create();
    browser = playwright.chromium().launch();
  }

  @AfterAll
  static void tearDownClass() {
    if (browser != null) browser.close();
    if (playwright != null) playwright.close();
  }

  @BeforeEach
  void setUp() {
    context = browser.newContext();
    page = context.newPage();
    page.goto("https://demo.playwright.dev/todomvc");
  }

  @AfterEach
  void tearDown() {
    if (context != null) context.close();
  }

  @Test
  @DisplayName("Should add a new todo item")
  void testAddTodo() {
    page.locator("input.new-todo").fill("Buy groceries");
    page.locator("input.new-todo").press("Enter");

    assertThat(page.locator(".todo-list li")).hasText("Buy groceries");
    assertThat(page.locator(".todo-count")).hasText("1 item left");
  }

  @Test
  @DisplayName("Should complete a todo item")
  void testCompleteTodo() {
    page.locator("input.new-todo").fill("Task to complete");
    page.locator("input.new-todo").press("Enter");
    page.locator(".toggle").check();

    assertThat(page.locator(".todo-list li")).hasClass("completed");
    assertThat(page.locator(".todo-count")).hasText("0 items left");
  }

  @Test
  @DisplayName("Should delete a todo item")
  void testDeleteTodo() {
    page.locator("input.new-todo").fill("Task to delete");
    page.locator("input.new-todo").press("Enter");
    page.locator(".todo-list li").hover();
    page.locator(".destroy").click();

    assertThat(page.locator(".todo-list li")).hasCount(0);
  }
}
```

**Run the suite:**
```bash
mvn test
```

**Output:**
```
TodoMVC Application Tests
  ✓ Should add a new todo item
  ✓ Should complete a todo item
  ✓ Should delete a todo item

Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
```

---

## 🎉 Summary

### **JUnit in Playwright-CRX:**

✅ **Select** JUnit from language dropdown
✅ **Record** your tests
✅ **Copy** generated code
✅ **Add** to Java project
✅ **Run** with Maven/Gradle/IDE
✅ **Integrate** with CI/CD

### **Key Benefits:**

| Feature | Benefit |
|---------|---------|
| **Annotations** | Clean, declarative test structure |
| **Lifecycle** | Automatic setup/teardown |
| **Isolation** | Each test runs independently |
| **Reporting** | Built-in test results |
| **IDE Support** | Run tests from IDE |
| **CI/CD** | Easy integration |

---

**Now you can generate professional JUnit tests directly from the Playwright Recorder!** ☕✨
