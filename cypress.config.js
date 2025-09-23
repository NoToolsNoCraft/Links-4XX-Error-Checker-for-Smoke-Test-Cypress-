const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // This is the event listener for our custom 'log' task
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
  },
})
