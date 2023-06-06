const functions = require('firebase-functions');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const { Storage } = require('@google-cloud/storage');
const vision = require('@google-cloud/vision');
const formidable = require('formidable-serverless');
const sharp = require('sharp');

const storage = new Storage();
const bucket = storage.bucket('gs://medrant-baa93.appspot.com/')

module.exports = {
    functions,
    initializeApp,
    getAuth,
    getFirestore,
    Timestamp,
    FieldValue,
    getStorage,
    bucket,
    formidable,
    sharp,
    vision,
};