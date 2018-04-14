import { Mongo } from 'meteor/mongo';
import { LocalizableCollection } from '../utilities'
import { developmentValidationEnabledFalse, Exchanges } from '../indexDB'
import SimpleSchema from 'simpl-schema';

let Currencies = {}

if (!Meteor.isTest) {
	Currencies = new LocalizableCollection('currencies', 'fetchCurrencies');
} else {
	Currencies = new Mongo.Collection('currencies')
}

export { Currencies }

Currencies.friendlySlugs({
  slugFrom: 'currencyName', 
  slugField: 'slug', 
  distinct: true, 
  updateSlug: true, 
  debug: false, 
  transliteration: [{ from: 'ü', to: 'u' }, { from: 'õö', to: 'o'}]
})

var { Integer, RegEx, oneOf } = SimpleSchema
var { Id, Domain } = RegEx

Currencies.schemaFuncs = {
//if this is normal altcoin that already exists returns true for required field for relevant fields
ifAltCoinExisting (){
  if (this.field("altcoin").value && !this.field("proposal").value){
    return null
  }
  return false
},
ifAltCoinWTV (){
  //original code that did these conditional checks
        //   //If the coin exists, no matter what it is //doesn't make sense
        //   if (altcoin && proposal) {
        //     checkSanity(data.genesisTimestamp, "intendedLaunch", "number", 13, 16); //didn't exist in first schema
        //     if (data.genesisTimestamp < 1509032068000) {
        //         error.push("genesisTimestamp");
        //         allowed = allowed.filter(function (i) {
        //             return i != "genesisTimestamp"
        //         })
        //     }
        // }
  if (this.field("altcoin").value && this.field("proposal").value){
    return null
  }
  return false
},
//If this is an ICO (launched or not)
ifICO () {
  if (this.field("ico").value){
    return null
  }
  return false
},
//If this is an ICO that hasnt launched yet
ifICOUnlaunched (){
  if (Currencies.schemaFuncs.ifICO == null && this.field("proposal").value){
    return null
  }
  return false
},
//If this is a bitcoin fork (planned or existing)
ifbtcfork (){
  if (this.field("btcfork").value){
    return null
  }
  return false
},
//If this is not proposal
ifNotProposal (){
  if (this.field("proposal").value){
    return null
  }
  return false
},
//parses checkboxes array to determine checked values
launchTagsAuto (){
  const fieldKeysToValues = {altcoin: "Altcoin", proposal: "proposal", btcfork: "Bitcoin Fork", ico: "ICO"}
  const currField = fieldKeysToValues[this.key]
  return !this.field(launchTags).value.filter(x=>x.tag==currField)
},
//returns null if value is defaultVal of dropdown that is self-populating
checkForDropdown (defaultVal) {
  return function(){
  if (this.value == defaultVal){
    return null
  } else {
    return this.value
  }
}
}
}

//pending and rejected Currencies copy from this schema using omit so that
//added fields here will copy them over to those collections
//patterened after addCoin method
Currencies.schema = new SimpleSchema({
_id: { type: Id }, 
currencyName: { type: String, min: 3, max: 20 }, //unique
currencySymbol: { type: String, min: 2, max: 5 }, //uppercase
premine: { type: Number, min: 1, max: 15, defaultValue: 0,}, //
maxCoins: { type: Integer, min: 4, max: 18, defaultValue: 0, },  //
consensusSecurity: { type: String, min: 6, max: 20, autoValue: Currencies.schemaFuncs.checkForDropdown("--Select One--"), }, //, null allowed yet check forDropwdown returns null
gitRepo: { type: Domain, min: 18, max: 300 },  //
officialSite: { type: Domain, min: 6, max: 200 },  //
reddit: { type: Domain, min: 12, max: 300, required: false, },  //n
blockExplorer: { type: Domain, min: 6, max: 300, required: false, }, //n
approvalNotes: { type: String }, //n for insert, required for edit?
currencyLogoFilename: { type: String, min: 1, max: 300 }, //req
confirmations: { type: Integer, min: 1, max: 4, custom(){Currencies.schemaFuncs.ifNotproposal}, }, //n
previousNames: { type: Array, minCount: 0, maxCount: 5, custom(){Currencies.schemaFuncs.ifAltCoinExisting},  }, //n, 0-5,
'previousNames.$': { type: Object }, 
'previousNames.$.tag': { type: String }, 
exchanges: { type: Array, minCount: 0, maxCount: 15, custom(){Currencies.schemaFuncs.ifNotProposal}, },  //n
'exchanges.$': { type: Object },
'exchanges.$.name': { type: String },
'exchanges.$.slug': { type: String },
'exchanges.$._id': { type: Id },
launchTags: { type: Array, minCount: 1, maxCount: 3, }, //
'launchTags.$': { type: Object },
'launchTags.$.tag': { type: String }, 
blockTime: { type: Integer, min: 1, max: 4, custom(){Currencies.schemaFuncs.ifNotProposal}, }, //n
forkHeight: { type: Integer, min: 6, max: 6, custom(){Currencies.schemaFuncs.ifbtcfork}, }, //n
forkParent: { type: String, min: 6, max: 20, autoValue: Currencies.schemaFuncs.checkForDropdown("-Select Fork Parent-"), required: Currencies.schemaFuncs.ifbtcfork }, //
replayProtection: { type: String, min: 4, max: 5, custom(){Currencies.schemaFuncs.ifbtcfork} }, //???
hashAlgorithm: { type: Id, min: 3, max: 40, autoValue: Currencies.schemaFuncs.checkForDropdown("--Select One--"), }, //n, null allowed yet checkForDrpdown
ICOfundsRaised: { type: Integer, min: 1, max: 15, custom(){Currencies.schemaFuncs.ifICO}, }, //
genesisTimestamp: { type: Number, min: 13, max: 16,  custom(){Currencies.schemaFuncs.altCoinExisting}, }, //genesisYear?
createdAt: { type: Number }, 
owner: { type: Id }, 
proposal: { type: Boolean, autoValue: Currencies.schemaFuncs.launchTagsAuto, }, //
altcoin: { type: Boolean, autoValue: Currencies.schemaFuncs.launchTagsAuto, }, //altcoin?
ico: { type: Boolean, autoValue: Currencies.schemaFuncs.launchTagsAuto, }, //icocurrency n?
icocurrency: { type: String, min: 3, max: 3, custom(){Currencies.schemaFuncs.ifICO}, },
ICOcoinsProduced: { type: Integer, min: 1, max: 15, custom(){Currencies.schemaFuncs.ifICO}, }, //n
ICOcoinsIntended: { type: Integer, min: 1, max: 15, custom(){Currencies.schemaFuncs.ifICOUnlaunched}, }, //n
ICOnextRound: { type: Integer, min: 13, max: 16, custom(){Currencies.schemaFuncs.ifICOUnlaunched}, }, //
icoDateEnd: { type: Integer, min: 13, max: 16, custom(){Currencies.schemaFuncs.ifICOUnlaunched}, }, //
// intendedLaunch: { type: Number, min: 13, max: 16, required: ifAltCoinWtv, }, //is actually derived from genesisTimestamp intended as duplicate field
btcfork: { type: Boolean, autoValue: Currencies.schemaFuncs.launchTagsAuto, }, //if not fork then altcoin
bountiesCreated: { type: Boolean }, 
approvedBy: { type: Id }, 
approvedTime: { type: Integer }, 
friendlySlugs: { type: Object, required: false },  
slug: { type: String, required: false }, 
eloRanking: { type: Number }, 
codebaseRanking: { type: Number }, 
decentralizationRanking: { type: Number }, 
walletRanking: { type: Number }, 
communityRanking: { type: Number }, 
gitCommits: { type: Integer }, 
gitUpdate: { type: Number }, 
}, { requiredByDefault: developmentValidationEnabledFalse });


Currencies.deny({
  insert() { return true; }, 
  update() { return true; }, 
  remove() { return true; }, 
});


