const functions = require('firebase-functions');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const formidable = require('formidable-serverless');
const sharp = require('sharp');

const storage = new Storage();
const bucket = storage.bucket('gs://moely-68eee.appspot.com/')

module.exports = {
    functions,
    cert,
    initializeApp,
    getAuth,
    Filter,
    getFirestore,
    Timestamp,
    FieldValue,
    getStorage,
    bucket,
    formidable,
    sharp,
    vision,
};