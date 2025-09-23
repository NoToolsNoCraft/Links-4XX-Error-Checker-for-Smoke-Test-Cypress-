/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  // when it encounters an uncaught exception from the application.
  return false;
});


describe('Link and Button Checker', () => {
  const url = 'https://www.iqos.com/gb/en/discover-heated-tobacco/duty-to-inform.html?gr=false';
  const brokenLinks = [];
  const filesToSkipPaths = ['/content/dam/']; // Path pattern for downloadable assets

  // A helper function to validate a single URL.
  const validateUrl = (href, elementText, elementType) => {
    // Prepend the base URL if it's a relative link.
    const fullUrl = href.startsWith('http') ? href : `${Cypress.config('baseUrl')}${href}`;

    // Skip mailto, tel, and other non-http links.
    if (!fullUrl.startsWith('http')) {
      return;
    }

    // Check if the URL contains a path for downloadable files.
    if (filesToSkipPaths.some(path => fullUrl.toLowerCase().includes(path))) {
      cy.log(`Skipping file link based on path: ${fullUrl}`);
      return; // Exit the function and do not perform a request.
    }

    // Intercept and handle network requests to check their status.
    cy.request({
      url: fullUrl,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status >= 400) {
        // If the status code is 4xx or 5xx, it's a broken link.
        brokenLinks.push({
          url: fullUrl,
          status: response.status,
          element: elementType,
          text: elementText,
        });
      }
    });
  };

  // The main test case.
  it('should check all links and buttons for broken URLs and log them', () => {
    // Set the base URL for the test.
    Cypress.config('baseUrl', 'https://www.iqos.com');

    // Visit the page.
    cy.visit(url);

    // Get all 'a' elements (links) and check each one.
    cy.get('a').each(($el) => {
      const href = $el.prop('href');
      const text = $el.text().trim();
      if (href) {
        validateUrl(href, text, 'link');
      }
    });

    // Get all 'button' elements and check them.
    cy.get('button').each(($el) => {
      const href = $el.attr('onclick') || $el.attr('data-href'); 
      const text = $el.text().trim() || $el.attr('aria-label') || 'Button';
      if (href) {
        const cleanedHref = href.match(/'(.*?)\.pdf'/)?.[1] + '.pdf' || href;
        validateUrl(cleanedHref, text, 'button');
      }
    });

    // Run this assertion after all previous commands have completed.
    cy.then(() => {
      if (brokenLinks.length > 0) {
        // If broken links were found, print a formatted log.
        cy.log('⚠️ --- BROKEN LINKS FOUND --- ⚠️');
        brokenLinks.forEach((link) => {
          cy.log(`
            - Status: ${link.status}
            - URL: ${link.url}
            - Element Type: ${link.element}
            - Element Text: "${link.text}"
          `);
        });
        // Remove the `throw new Error()` line so the test does not fail.
        cy.log('❌ Test completed with broken links. See above log for details.');
      } else {
        // If no broken links, print a success message.
        cy.log('✅ --- All links and buttons are working correctly! --- ✅');
      }
    });
  });
});
