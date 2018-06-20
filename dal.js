/*
client --> | --> instruments-api --> dal --> | --> couchdb
*/

require('dotenv').config()
const { merge } = require('ramda')
const PouchDB = require('pouchdb-core')
const pkGen = require('./lib/pk-gen')

PouchDB.plugin(require('pouchdb-adapter-http'))

const db = new PouchDB(
  `${process.env.COUCH_HOSTNAME}${process.env.COUCH_DBNAME}`
)

const getInstrument = (id, callback) => db.get(id, callback)

const deleteInstrument = (instrumentID, callback) => {
  db.get(instrumentID, function(err, doc) {
    if (err) {
      callback(err)
      return
    }
    db.remove(doc, function(err, deleteResult) {
      if (err) {
        callback(err)
        return
      }
      callback(null, deleteResult)
    })
  })
}

const addInstrument = (instrument, callback) => {
  console.log('HI Im inside addInstrument')

  const modifiedInstrument = merge(instrument, {
    type: 'instrument',
    _id: pkGen('instrument', '_', `${instrument.category} ${instrument.name}`)
  })
  db.put(modifiedInstrument, callback)
}

const updateInstrument = (instrument, callback) => db.put(instrument, callback)

///////////////////////////
////  HELPER FUNCTIONS ////
///////////////////////////
/*
function getDoc(id, callback) {
  db.get(id, callback)
}
*/

const dal = {
  getInstrument,
  addInstrument,
  deleteInstrument,
  updateInstrument
}

module.exports = dal
