context('home_contact', () => {
  const data = {}
  data["form"] = {}
  data["form"]["uniq"] = Date.now()
  data["form"]["first_name"] = data["form"]["uniq"].toString()
  data["form"]["last_name"] = data["form"]["uniq"].toString()
  data["form"]["email"] = "qa@swan.io"
  data["form"]["website"] = "https://www.swan.io"
  data["form"]["linkedin"] = "https://www.linkedin.com/company/swan-baas"
  data["form"]["country"] = "France"
  data["form"]["reason"] = "I just love Swan's APIs!"
  data["form"]["message"] = "Hello, this is the QA team doing his work!"
  data["form"]["newsletter"] = true

  context('after visiting [swan.io], hovering [Resources] option, clicking on [Contact] option, filling [first-name, last-name, email, linkedin, website, country, reason, message] inputs, checking [subscribe, agree] inputs and clicking on [Contact Us] button', () => {
    let getFormPostedNetwork
    before(() => {
      cy.visit('https://www.swan.io')

      cy.get(`[class*="link"]:contains("Contact"):eq(0)`).click({
        force: true
      })

      cy.get(`form[id*="Contact"]`).within(r => {
        cy.get(`input[name*="First"]`).clear().type(data["form"]["first_name"])
        cy.get(`input[name*="Last"]`).clear().type(data["form"]["last_name"])
        cy.get(`input[name*="Email"]`).clear().type(data["form"]["email"])
        cy.get(`input[name*="LinkedIn"]`).clear().type(data["form"]["linkedin"])
        cy.get(`input[name*="Website"]`).clear().type(data["form"]["website"])
        cy.get(`select[id*="country"]`).select(data["form"]["country"], {
          force: true
        })
        cy.get(`select[id*="reason"]`).select(data["form"]["reason"], {
          force: true
        })
        cy.get(`textarea[id*="message"]`).type(data["form"]["message"])

        cy.get(`input[name*="newsletter"]`).check({
          force: data["form"]["newsletter"]
        })
        cy.get(`input[name*="process"]`).check({
          force: true
        })
        cy.intercept('POST', `**/form/**`).as('getFormPosted')
        cy.get(`input[type="submit"]`).click().wait("@getFormPosted").then(r => {
          getFormPostedNetwork = r
        })
      })
    })

    it('form is posted', () => {
      const request = Object.fromEntries(new URLSearchParams(getFormPostedNetwork["request"]["body"]))
      expect(request["fields[Email]"]).to.eq(data["form"]["email"])
      expect(request["fields[First name]"]).to.eq(data["form"]["first_name"])
      expect(request["fields[Last name]"]).to.eq(data["form"]["last_name"])
      expect(request["fields[LinkedIn Profile]"]).to.eq(data["form"]["linkedin"])
      expect(request["fields[Website URL]"]).to.eq(data["form"]["website"])
      expect(request["fields[country/region]"]).to.eq(data["form"]["country"])
      expect(request["fields[message-reason]"]).to.eq(data["form"]["reason"])
      expect(request["fields[message]"]).to.eq(data["form"]["message"])
      expect(request["fields[subscribe to our newsletter for the latest news and product updates.]"]).to.eq(data["form"]["newsletter"].toString())
      const response = getFormPostedNetwork["response"]["body"]
      expect(response["code"]).to.eq(200)
    })
  })

})