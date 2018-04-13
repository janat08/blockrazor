import { Mongo } from 'meteor/mongo';
import { developmentValidationEnabledFalse, Communities } from '../indexDB'
import SimpleSchema from 'simpl-schema';

export const Codebase = new Mongo.Collection('codebase')

var { Integer, RegEx } = SimpleSchema
var { Id, Domain } = RegEx

Codebase.schema = new SimpleSchema({
  _id: { type: Id },
  url: { type: Domain },
  currencyId: { type: Id },
  currencyName: { type: String },
  image: { type: String },
  createdAt: { type: Number },
  createdBy: { type: Id },
}, { requiredByDefault: developmentValidationEnabledFalse });
// new SimpleSchema(Communities.schema, { requiredByDefault: developmentValidationEnabledFalse });

Codebase.deny({
  insert() { return true; },
  update() { return true; },
  remove() { return true; },
});