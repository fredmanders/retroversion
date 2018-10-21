const functions = require('firebase-functions');
const admin = require('firebase-admin');
const vision = require('@google-cloud/vision');
const visionClient =  new vision.ImageAnnotatorClient();
let Promise = require('promise');
const cors = require('cors')({ origin: true });
const request = require('request');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();
const settings = {timestampsInSnapshots: true};
db.settings(settings);

exports.annotateImage = functions.firestore.document('photos/{document}')
.onCreate((snap, context) => {

	console.log('SNAP', snap)
	console.log('CONTEXT', context)

	const data = snap.data();
	console.log('DATA IN IS', data)
	const photoUrl = "gs://" + data.bucket + "/" + data.fullPath;
	console.log('url is', photoUrl);

	const request = {
		image: {source: {imageUri: photoUrl}},
		features: [
			{
				"type": "FACE_DETECTION",
				"maxResults": 3
			},
			{
				"type": "LANDMARK_DETECTION",
				"maxResults": 3
			},
			{
				"type": "LOGO_DETECTION",
				"maxResults": 3
			},
			{
				"type": "LABEL_DETECTION",
				"maxResults": 10
			},
			{
				"type": "TEXT_DETECTION",
				"maxResults": 3
			},
			{
				"type": "SAFE_SEARCH_DETECTION",
				"maxResults": 3
			},
			{
				"type": "WEB_DETECTION",
				"maxResults": 10
			},
		],
	};

	return Promise.resolve()
	.then(() => {
		return visionClient.annotateImage(request);
	})
	.then(results => {
		console.log('annotateImage data all is: ', results)
		const googleVision = results[0];

		db.collection('photos').doc(context.params.document).update({ googleVision })
			.then(res => console.log('vision data added'))
			.catch(err => console.error(err));
	})
	.catch(err => console.error(err));
})