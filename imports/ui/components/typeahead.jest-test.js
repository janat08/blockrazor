// import * as ren from 'blaze-renderer'
import renderBlaze, {parseTemplates, renderBlazeWithData} from 'blaze-renderer'
// import assert from 'assert'
import { runInFiber } from "testable-meteor";

// require ('./typeahead.parent.js')
import './typeahead.parent.js'
// import './loading.js'

const baseUrl = 'http://localhost:3000' // baseUrl of the app we are testing, it's localhost here, as we're starting a local server in Travis CI cycle

// describe('test', function() {
// 	it ('passes', function() {
// 		assert(true, true) 
// 	})
// })

//see the full webdriverio browser API here: http://webdriver.io/api.html
// describe('Home page', function () {
//     it('Currencies should render properly', function () {
//         browser.url(`${baseUrl}/`) // navigate to the home route `/`
//         browser.pause(2000) // let it load, wait for 2 seconds
//         assert(browser.isExisting('.currency-card'), true) // check if at least one currency card has rendered, isExisting === $() !== undefined
//         assert(browser.isVisible('.currency-card'), true) // check if at least one currency card is visible on the page isVisible === $().is(':visible')
//     })
// // })

// it('parse templates', runInFiber(() => {
// 	console.log(ren)
// 	expect(ren.parseTemplates(ren.returnAllTemplates('imports/'))).toMatchSnapshot()
// }))

 test('renders typeahead', runInFiber(() => {
    const typeahead = renderBlaze('typeaheadSnapshotTesting')
    expect(typeahead).toMatchSnapshot()
}))
