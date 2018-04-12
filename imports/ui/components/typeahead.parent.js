import './typeahead'
import './typeahead.parent.html'
import { Currencies } from '../../api/indexDB.js'
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";

//testing template since typeahead template depends on parent template instance
Template.typeaheadSnapshotTesting.onCreate(()=>{
	this.selectedId = new ReactiveVar()
})

Template.typeaheadSnapshotTesting.helpers({
	params(){
        return {
    	    limit: 15,
            query: function(templ, entry) {
                return {
               		$or: [{
                 		currencyName: new RegExp(entry, 'ig')
               		}, {
                 		currencySymbol: new RegExp(entry, 'ig')
               		}],
             	}
           },
           projection: function(templ, entry) {
             	return {
               		limit: 15,
               		sort: {
                 		currencyName: 1
              		}
             	}
           	},
           	add: function(event, doc, templ) {
           		templ.selectedId.set(doc.currencySymbol)
           	},
           	col: Currencies, //collection to use
           	template: Template.instance(), //parent template instance
           	focus: false,
           	autoFocus: false,
          	quickEnter: true,
           	displayField: 'currencyName', //field that appears in typeahead select menu
           	placeholder: 'Search cryptocurrencies'
        }
    }
})
