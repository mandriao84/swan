context('home_login-challenge', () => {
  const data = {}
  data["form_start"] = {}
  data["form_start"]["uniq"] = Date.now()
  data["form_start"]["first_name"] = data["form_start"]["uniq"].toString()
  data["form_start"]["last_name"] = data["form_start"]["uniq"].toString()
  data["form_start"]["email"] = "qa@swan.io"
  data["form_start"]["phone"] = `06${data["form_start"]["uniq"].toString().slice(-8)}`
  data["form_start"]["company_name"] = "qa"
  data["form_start"]["company_website"] = "swan.io"
  data["form_start"]["company_country"] = "France"
  data["form_start"]["newsletter"] = true
  data["form_start"]["otp"] = {}

  context('after visiting [swan.io], clicking on [Start now] button (x2), filling [first-name, last-name, email, company-name, company-website] inputs, checking [subscribe, agree] inputs, clicking on [Submit] button, clicking on [Confirm my number] button, filling [phone] input and clicking on [Next] button', () => {
    let getFormPostedNetwork, getAuthenticatedNetwork
    before(() => {
      cy.visit('https://www.swan.io')
      cy.get(`[id*="menu"]`).within(r => {
        cy.get(`[class*="button"]:contains("now"):eq(0)`).click()
      })

      cy.get(`section[class*="content"]`).within(r => {
        cy.get(`[class*="button"]:contains("Now"):eq(0)`).click({
          force: true
        })
      })

      cy.get(`form[id*="now"]`).within(r => {
        cy.get(`input[name*="First"]`).clear().type(data["form_start"]["first_name"])
        cy.get(`input[name*="Last"]`).clear().type(data["form_start"]["last_name"])
        cy.get(`input[name*="Email"]`).clear().type(data["form_start"]["email"])
        cy.get(`input[name*="company-name"]`).clear().type(data["form_start"]["company_name"])
        cy.get(`input[name*="Website"]`).clear().type(data["form_start"]["company_website"])
        cy.get(`input[name*="newsletter"]`).check({
          force: data["form_start"]["newsletter"]
        })
        cy.get(`input[name*="checkbox"]`).check({
          force: true
        })
        cy.intercept('POST', `**/form/**`).as('getFormPosted')
        cy.get(`input[type="submit"]`).click().wait("@getFormPosted").then(r => {
          getFormPostedNetwork = r
        })
      })

      cy.get(`section[class*="content"]`).within(r => {
        cy.get(`[class*="button"]:contains("number"):eq(0)`).click({
          force: true
        })
      })

      cy.get(`[role="button"]:not(:contains("Next")):eq(0)`).click()
      cy.get(`input[type="search"]`).clear().type(data["form_start"]["company_country"])
      cy.get(`[tabindex="0"]:contains(${data["form_start"]["company_country"]}):eq(0)`).click({
        force: true
      })
      cy.get(`input[type="tel"]`).clear().type(data["form_start"]["phone"])
      cy.intercept('POST', `**/unauthenticated/**`).as('getAuthenticated')
      cy.get(`[role="button"]:contains("Next"):eq(0)`).click().wait("@getAuthenticated").then(r => {
        getAuthenticatedNetwork = r
        const request = getAuthenticatedNetwork["request"]["body"]
        const response = getAuthenticatedNetwork["response"]["body"]
        data["form_start"]["otp"]["bot_request_id"] = request["variables"]["input"]["botdRequestId"]
        data["form_start"]["otp"]["challenge_id"] = request["variables"]["input"]["loginChallenge"]
        data["form_start"]["otp"]["request_id"] = response["data"]["sendOtp"]["requestId"]
        data["form_start"]["otp"]["phone"] = response["data"]["sendOtp"]["mobilePhoneNumber"]
      })
    })

    it('form is posted', () => {
      const request = Object.fromEntries(new URLSearchParams(getFormPostedNetwork["request"]["body"]))
      expect(request["fields[Email]"]).to.eq(data["form_start"]["email"])
      expect(request["fields[Enter your company name]"]).to.eq(data["form_start"]["company_name"])
      expect(request["fields[First name]"]).to.eq(data["form_start"]["first_name"])
      expect(request["fields[Last Name]"]).to.eq(data["form_start"]["last_name"])
      expect(request["fields[Website URL]"]).to.eq(data["form_start"]["company_website"])
      expect(request["fields[subscribe to our newsletter for the latest news and product updates.]"]).to.eq(data["form_start"]["newsletter"].toString())
      const response = getFormPostedNetwork["response"]["body"]
      expect(response["code"]).to.eq(200)
    })
    it('otp is sent', () => {
      expect(data["form_start"]["otp"]["request_id"].length).to.be.above(10)
      let phone_number = data["form_start"]["phone"].split('')
      phone_number[0] = "+33"
      data["form_start"]["phone"] = phone_number.join('')
      expect(data["form_start"]["otp"]["phone"]).to.eq(data["form_start"]["phone"])
    })
  })

})