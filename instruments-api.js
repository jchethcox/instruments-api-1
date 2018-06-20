const port = process.env.PORT || 5000
const { getInstrument, addInstrument, deleteInstrument } = require('./dal')
// let database = require('./load-data')

require('dotenv').config()
const express = require('express')
const app = express()
const {
  find,
  isEmpty,
  propOr,
  append,
  merge,
  not,
  isNil,
  filter,
  compose,
  reject,
  propEq,
  map,
  pathOr,
  split,
  head,
  last,
  path
} = require('ramda')

const bodyParser = require('body-parser')
const checkRequiredFields = require('./lib/check-required-fields')
const createMissingFieldsMsg = require('./lib/create-missing-field-msg')
const cleanObj = require('./lib/clean-obj')
const NodeHTTPError = require('node-http-error')

const isInstrumentInDatabase = (_id, database) =>
  compose(
    not,
    isNil,
    find(instrument => instrument.id === _id),
    filter(propEq('type', 'instrument'))
  )(database)

app.use(bodyParser.json())

app.get('/', function(req, res, next) {
  res.send('Welcome to the Instruments api.')
})

app.get('/instruments/:instrumentID', function(req, res, next) {
  const instrumentID = req.params.instrumentID
  getInstrument(instrumentID, function(err, data) {
    if (err) {
      next(new NodeHTTPError(err.status, err.message, err))
      return
    }
    res.status(200).send(data)
  })
})

app.post('/instruments', function(req, res, next) {
  const newInstrument = propOr({}, 'body', req)

  if (isEmpty(newInstrument)) {
    next(new NodeHTTPError(400, 'missing instrument in body'))
    return
  }

  const missingFields = checkRequiredFields(
    ['name', 'category', 'group', 'retailPrice', 'manufacturer'],
    newInstrument
  )

  if (not(isEmpty(missingFields))) {
    next(new NodeHTTPError(400, 'missing field(s) in body'))
    return
  }

  const cleanedInstrument = cleanObj(
    ['name', 'category', 'group', 'retailPrice', 'manufacturer'],
    newInstrument
  )

  addInstrument(cleanedInstrument, function(err, data) {
    if (err) {
      next(new NodeHTTPError(err.status, err.message, { error: 'error here' }))
    }
    res.status(201).send(data)
  })
})

app.delete('/instruments/:id', function(req, res, next) {
  const instrumentID = req.params.id
  deleteInstrument(instrumentID, function(err, data) {
    if (err) {
      next(new NodeHTTPError(err.status, err.message, err))
      return
    }
    res.status(200).send(data)
  })
})

app.put('instruments/:id', function(req, res, next) {
  const newInstrument = propOr({}, 'body', req)

  if (isEmpty(newInstrument)) {
    next(new NodeHTTPError(400, 'Empty Muffucka'))
    return
  }
  const missingFields = checkRequiredFields(
    [
      '_id',
      '_rev',
      'name',
      'type',
      'category',
      'group',
      'retailPrice',
      'manufacturer'
    ],
    newInstrument
  )
  if (not(isEmpty(missingFields))) {
    next(new NodeHTTPError(400, `${createMissingFieldsMsg(missingFields)}`))
    return
  }
  if (not(propEq('id', req.params.id, newInstrument))) {
    next(new NodeHTTPError(400, 'This id doesnt match the URI path id value'))
    return
  }

  const newNewInstrument = cleanObj(
    ['name', 'type', 'category', 'group', 'retailPrice', 'manufacturer'],
    newInstrument
  )

  replaceInstrument(cleanedInstrument, function(err, replaceResult) {
    if (err) {
      next(new NodeHTTPError(err.status, err.message, err))
    }
    res.status(200).send(replaceResult)
  })
})

app.use(function(err, req, res, next) {
  console.log(
    'ERROR! ',
    'METHOD: ',
    req.method,
    ' PATH',
    req.path,
    ' error:',
    JSON.stringify(err)
  )
  res.status(err.status || 500)
  res.send(err)
})

app.listen(port, () => console.log('API is up', port))
