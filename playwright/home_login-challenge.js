const { test, expect } = require('@playwright/test');

const login = {}
login["uniq"] = Date.now()
login["firstName"] = login["uniq"].toString()
login["lastName"] = login["firstName"]
login["email"] = `${login["firstName"]}@gmail.com`
login["phoneNumber"] = `06${login["uniq"].toString().slice(-8)}`
login["phoneNumberFormatted"] = function() {
    let arrPhoneNumber = this.phoneNumber.split('')
    arrPhoneNumber[0] = "+33"
    return arrPhoneNumber.join('')
}
login["companyUrl"] = `https://www.swan.io`
login["companyCountry"] = `France`
login["subscribeNewsletter"] = true

test('after visiting [swan.io], clicking on [Start now] button, clicking on [Start Now] button, filling [...] inputs, clicking on [Submit] button, clicking on [Confirm my number] button, filling [Phone number] input, clicking on [Next] button', async ({ page }) => {
  page.on('response', async r => {
    if (r.url().includes("/submit/form")) {
      console.log(await r.request().postDataJSON())
    }
    if (r.url().includes("/unauthenticated/graphql")) {
      login["networkResponseUnauthenticated"] = await r.json()
    }
  })
  await page.goto('https://www.swan.io/')
  await page.locator('a > [class*=button]:has-text("now")').click()
  await page.locator('a[class*=button]:has-text("Now")').click()
  await page.locator('input[id*=first]').fill(login["firstName"])
  await page.locator('input[id*=Last]').fill(login["lastName"])
  await page.locator('input[id*=Email]').fill(login["email"])
  await page.locator('input[id*=URL]').fill(login["companyUrl"])
  await page.locator('span[for*=newsletter]').check()
  await page.locator('span[for*=checkbox]').check()
  await page.locator('input[type=submit][data-w-id]').click()
  await page.waitForResponse('**/submit/form')
  await page.locator('a[class*=button]:has-text("number")').click()
  await page.locator('[role="button"][tabindex]', { has: page.locator('use') }).click()
  await page.locator('input[type="search"]').fill(login["companyCountry"])
  await page.locator(`[tabindex="0"]:has-text("${login["companyCountry"]}")`).click()
  await page.locator('input[type="tel"]').fill(login["phoneNumber"])
  await page.locator('[role="button"]:has-text("Next")').click()
  await page.waitForResponse('**/unauthenticated/graphql')

  const networkResponseUnauthenticated = login["networkResponseUnauthenticated"]
  await expect(networkResponseUnauthenticated["data"]["sendOtp"]["requestId"]).toBeGreaterThan(10)
  await expect(networkResponseUnauthenticated["data"]["sendOtp"]["mobilePhoneNumber"]).toBe(login["phoneNumberFormatted"]())
})
