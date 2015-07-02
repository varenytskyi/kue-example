assert = require('assert')
fs = require('fs')
webdriver = require('browserstack-webdriver')
test = require('browserstack-webdriver/testing')


test.describe 'Test staging login', ->
  test.before ->
    capabilities = 
      'browserName': 'firefox'
      'browserstack.user': 'richardbarber4'
      'browserstack.key': 'u3GsyD99Qcemq7zByv3M'
    @driver = (new (webdriver.Builder)).usingServer('http://hub.browserstack.com/wd/hub')
      .withCapabilities(capabilities).build()

  test.it 'Should login to Dashboard', ->
    @driver.get 'http://staging.knotable.com'
    @driver.findElement(webdriver.By.name('email')).sendKeys 'knoteqa1@test.knote.com'
    @driver.findElement(webdriver.By.name('password')).sendKeys 'qa@knote1'
    @driver.findElement(webdriver.By.id('login-button')).click()
    @driver.wait ( =>
      @driver.getTitle().then (title) -> 'Dashboard' == title
    ), 10000

  test.it 'Should throw an error', ->
    @driver.get 'http://staging.knotable.com'
    @driver.wait (=>
      @driver.getTitle().then (title) -> 'Just a test title' == title
    ), 1000

  test.after ->
    @driver.quit()
