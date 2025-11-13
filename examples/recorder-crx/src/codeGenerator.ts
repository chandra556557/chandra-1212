/**
 * Copyright (c) Rui Figueira.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export type Language = 'javascript' | 'python' | 'java' | 'java-junit' | 'csharp' | 'robot';

export interface CodeTemplate {
  header: string;
  footer: string;
  actions: Record<string, string>;
}

export class CodeGenerator {
  private templates: Record<Language, CodeTemplate> = {
    javascript: {
      header: `import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {`,
      footer: `});`,
      actions: {
        'click': `  await page.locator('{{locator}}').click();`,
        'fill': `  await page.locator('{{locator}}').fill('{{text}}');`,
        'press': `  await page.locator('{{locator}}').press('{{key}}');`,
        'assertText': `  await expect(page.locator('{{locator}}')).toHaveText('{{text}}');`,
        'assertVisibility': `  await expect(page.locator('{{locator}}')).toBeVisible();`,
        'goto': `  await page.goto('{{url}}');`,
        'waitForTimeout': `  await page.waitForTimeout({{timeout}});`
      }
    },
    python: {
      header: `import asyncio
import pytest
from playwright.async_api import async_playwright

async def test_example():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()`,
      footer: `        await browser.close()`,
      actions: {
        'click': `        await page.locator("{{locator}}").click()`,
        'fill': `        await page.locator("{{locator}}").fill("{{text}}")`,
        'press': `        await page.locator("{{locator}}").press("{{key}}")`,
        'assertText': `        assert (await page.locator("{{locator}}").text_content()) == "{{text}}"`,
        'assertVisibility': `        assert await page.locator("{{locator}}").is_visible()`,
        'goto': `        await page.goto("{{url}}")`,
        'waitForTimeout': `        await page.wait_for_timeout({{timeout}})`
      }
    },
    java: {
      header: `import com.microsoft.playwright.*;
import com.microsoft.playwright.options.*;
import static com.microsoft.playwright.assertions.PlaywrightAssertions.*;

public class TestExample {
  public static void main(String[] args) {
    try (Playwright playwright = Playwright.create()) {
      Browser browser = playwright.chromium().launch();
      BrowserContext context = browser.newContext();
      Page page = context.newPage();`,
      footer: `    }
  }
}`,
      actions: {
        'click': `      page.locator("{{locator}}").click();`,
        'fill': `      page.locator("{{locator}}").fill("{{text}}");`,
        'press': `      page.locator("{{locator}}").press("{{key}}");`,
        'assertText': `      assertThat(page.locator("{{locator}}")).hasText("{{text}}");`,
        'assertVisibility': `      assertThat(page.locator("{{locator}}")).isVisible();`,
        'goto': `      page.navigate("{{url}}");`,
        'waitForTimeout': `      page.waitForTimeout({{timeout}});`
      }
    },
    'java-junit': {
      header: `import com.microsoft.playwright.*;
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
  void testExample() {`,
      footer: `  }
}`,
      actions: {
        'click': `    page.locator("{{locator}}").click();`,
        'fill': `    page.locator("{{locator}}").fill("{{text}}");`,
        'press': `    page.locator("{{locator}}").press("{{key}}");`,
        'assertText': `    assertThat(page.locator("{{locator}}")).hasText("{{text}}");`,
        'assertVisibility': `    assertThat(page.locator("{{locator}}")).isVisible();`,
        'goto': `    page.goto("{{url}}");`,
        'waitForTimeout': `    page.waitForTimeout({{timeout}});`
      }
    },
    csharp: {
      header: `using Microsoft.Playwright;
using System.Threading.Tasks;

class Program
{
    public static async Task Main()
    {
        using var playwright = await Playwright.CreateAsync();
        await using var browser = await playwright.Chromium.LaunchAsync();
        var page = await browser.NewPageAsync();`,
      footer: `    }
}`,
      actions: {
        'click': `        await page.Locator("{{locator}}").ClickAsync();`,
        'fill': `        await page.Locator("{{locator}}").FillAsync("{{text}}");`,
        'press': `        await page.Locator("{{locator}}").PressAsync("{{key}}");`,
        'assertText': `        await Expect(page.Locator("{{locator}}")).ToHaveTextAsync("{{text}}");`,
        'assertVisibility': `        await Expect(page.Locator("{{locator}}")).ToBeVisibleAsync();`,
        'goto': `        await page.GotoAsync("{{url}}");`,
        'waitForTimeout': `        await page.WaitForTimeoutAsync({{timeout}});`
      }
    },
    robot: {
      header: `*** Settings ***
Library    Browser

*** Test Cases ***
Example Test
    New Browser    chromium    headless=false`,
      footer: `    Close Browser`,
      actions: {
        'click': `    Click    {{locator}}`,
        'fill': `    Fill Text    {{locator}}    {{text}}`,
        'press': `    Press Keys    {{locator}}    {{key}}`,
        'assertText': `    Get Text    {{locator}}    ==    {{text}}`,
        'assertVisibility': `    Get Element State    {{locator}}    visible`,
        'goto': `    New Page    {{url}}`,
        'waitForTimeout': `    Sleep    {{timeout}}ms`
      }
    }
  };

  /**
   * Generate code for a specific language
   */
  generateCode(language: Language, actions: any[]): string {
    const template = this.templates[language];
    if (!template) {
      throw new Error(`Unsupported language: ${language}`);
    }

    let code = template.header + '\n';

    for (const action of actions) {
      const actionTemplate = template.actions[action.name];
      if (actionTemplate) {
        let line = actionTemplate;

        // Replace placeholders
        Object.keys(action).forEach(key => {
          if (key !== 'name') {
            const regex = new RegExp(`{{${key}}}`, 'g');
            line = line.replace(regex, action[key]);
          }
        });

        code += line + '\n';
      }
    }

    code += template.footer;
    return code;
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Language[] {
    return Object.keys(this.templates) as Language[];
  }

  /**
   * Get template for a specific language
   */
  getTemplate(language: Language): CodeTemplate {
    return this.templates[language];
  }

  /**
   * Add or update a template
   */
  setTemplate(language: Language, template: CodeTemplate): void {
    this.templates[language] = template;
  }
}

// Export singleton instance
export const codeGenerator = new CodeGenerator();
