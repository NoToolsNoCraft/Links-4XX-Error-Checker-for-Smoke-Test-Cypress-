# Cypress Link and Button Checker

This repository contains an automated **Cypress test** and **GitHub Actions workflow** that validates all links and buttons on a given page.  
The test ensures that no broken links (status code `>= 400`) exist on the target website.  
Logs and results are printed directly in the GitHub Actions output.

---

## 🔍 What the Test Does

The Cypress test (`cypress/e2e/link-checker.cy.js`) performs the following:

1. **Visits the target page** – currently:

2. **Collects all `<a>` tags and `<button>` elements** on the page.

3. **Validates each URL**:
- Skips non-HTTP links and specific file paths (e.g., `/content/dam/`).
- Uses `cy.request()` to check the HTTP status of each link.

4. **Logs results**:
- If a link is broken (`status >= 400`), it is logged with:
  - Status code  
  - Full URL  
  - Element type (`link` or `button`)  
  - Element text (or aria-label for buttons)  
- If no issues are found, a success message is logged.

---

## 🛠 Project Setup
Clone the repository:
```bash
git clone https://github.com/<your-repo>.git
cd <your-repo>
Install dependencies:


npm install
Open Cypress test runner (interactive mode):


npx cypress open
Run tests in headless mode:


npx cypress run
