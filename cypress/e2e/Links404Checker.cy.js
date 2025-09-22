/// <reference types="cypress" />

Cypress.on("uncaught:exception", () => {
  return false; // ignore app-level uncaught errors
});

const baseUrl = "https://www.iqos.com/gb/en/discover-heated-tobacco/duty-to-inform.html?gr=false";

// helper to accept/dismiss cookie banner if present
function handleCookieBanner() {
  cy.get("body").then(($body) => {
    if ($body.find("#onetrust-accept-btn-handler").length > 0) {
      cy.get("#onetrust-accept-btn-handler").click({
        force: true
      });
    }
  });
}

// helper to solve SAG if it shows up
function solveSAG() {
  cy.get("body").then(($body) => {
    if ($body.find('[data-pmi-el="sag-1"]').length > 0) {
      // Month
      cy.get("#dropdownMonths").click({
        force: true
      });
      cy.get("#sag-month-01").check({
        force: true
      });

      // Year
      cy.get("#dropdownYears").click({
        force: true
      });
      cy.get("#sagyear1990").check({
        force: true
      });

      // Confirm button
      cy.get("body").then(($b) => {
        if ($b.find("#sag-confirm-btn").length > 0) {
          cy.get("#sag-confirm-btn").click({
            force: true
          });
          // wait a few seconds for page to load fully
          cy.wait(3000);
        }
      });
    }
  });
}

describe("IQOS Page Link/CTA Integrity", () => {
  let brokenLinks = [];

  beforeEach(() => {
    cy.visit(baseUrl);
    handleCookieBanner();
    solveSAG();
  });

  it("should check all links and CTAs for 4xx errors", () => {
    cy.get("a[href], button[href], [data-href], [data-url]").each(($el) => {
      let href = $el.prop("href") || $el.attr("data-href") || $el.attr("data-url");

      if (href && href.startsWith("https:") 
               && !href.includes('mailto:') 
               && !href.match(/\.(pdf|jpg|jpeg|png|gif|svg|mp4|webp)(\?.*)?$/i)
               
              ) {
        cy.request({
          url: href,
          failOnStatusCode: false,
        }).then((resp) => {
          if (resp.status >= 400 && resp.status < 500) {
            brokenLinks.push({
              link: href,
              element: $el.prop('outerHTML'),
              status: resp.status
            });
          }
        });
      }
    });
  });

  after(() => {
  if (brokenLinks.length > 0) {
    const header = '--- BROKEN LINKS REPORT (4xx Errors) ---';
    cy.log(header);
    console.log(header);

    brokenLinks.forEach((item, index) => {
      const errorLine = `[${index + 1}] Error ${item.status} Found: ${item.link}`;
      const elementLine = `Element: ${item.element}`;

      cy.log(errorLine);
      console.log(errorLine);

      cy.log(elementLine);
      console.log(elementLine);
    });

    const footer = '-------------------------------------------';
    cy.log(footer);
    console.log(footer);
  } else {
    const success = '✅ All links and CTAs checked successfully. No 4xx errors found.';
    cy.log(success);
    console.log(success);
  }
});
});
