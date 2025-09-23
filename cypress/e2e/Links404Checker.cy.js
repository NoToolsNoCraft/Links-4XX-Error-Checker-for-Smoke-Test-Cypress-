/// <reference types="cypress" />

Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test
  // when it encounters an uncaught exception from the application.
  return false;
});




describe('Link and Button Checker', () => {
  const url = 'https://www.iqos.com/gb/en/discover-heated-tobacco/duty-to-inform.html?gr=false';
  const brokenLinks = [];
  const filesToSkipPaths = ['/content/dam/'];

  // A helper function to validate a single URL.
  const validateUrl = (href, elementText, elementType) => {
    const fullUrl = href.startsWith('http') ? href : `${Cypress.config('baseUrl')}${href}`;

    if (!fullUrl.startsWith('http')) {
      return;
    }

    if (filesToSkipPaths.some(path => fullUrl.toLowerCase().includes(path))) {
      // Use cy.task() to log that we are skipping this link
      cy.task('log', `Skipping file link based on path: ${fullUrl}`);
      return;
    }

    cy.request({
      url: fullUrl,
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status >= 400) {
        brokenLinks.push({
          url: fullUrl,
          status: response.status,
          element: elementType,
          text: elementText,
        });
      }
    });
  };

  it('should check all links and buttons for broken URLs and log them', () => {
    Cypress.config('baseUrl', 'https://www.iqos.com');
    cy.visit(url);

    cy.get('a').each(($el) => {
      const href = $el.prop('href');
      const text = $el.text().trim();
      if (href) {
        validateUrl(href, text, 'link');
      }
    });

    cy.get('button').each(($el) => {
      const href = $el.attr('onclick') || $el.attr('data-href');
      const text = $el.text().trim() || $el.attr('aria-label') || 'Button';
      if (href) {
        const cleanedHref = href.match(/'(.*?)\.pdf'/)?.[1] + '.pdf' || href;
        validateUrl(cleanedHref, text, 'button');
      }
    });

    cy.then(() => {
      if (brokenLinks.length > 0) {
        // Use cy.task() to send the log message
        cy.task('log', '⚠️ --- BROKEN LINKS FOUND --- ⚠️');
        brokenLinks.forEach((link) => {
          cy.task('log', `
            - Status: ${link.status}
            - URL: ${link.url}
            - Element Type: ${link.element}
            - Element Text: "${link.text}"
          `);
        });
        cy.task('log', '❌ Test completed with broken links. See above log for details.');
      } else {
        cy.task('log', '✅ --- All links and buttons are working correctly! --- ✅');
      }
    });
  });
});
