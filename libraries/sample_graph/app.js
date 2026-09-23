// TODO cache sounds for hover stuff to not be horrifying
const baseApiPath = "http://127.0.0.1:16769";

//#region Feature

let audio = document.getElementById('release-audio');

function featurePlayAudio(feature) {
    audio.src = encodeURI(`${baseApiPath}/${feature.path}`);
    audio.load();
    audio.play();
}

//#endregion
//#region Features

let SelectedNodes = new Set();
let Features = new Map();

const NumSimilarFeatures = 16;

const DistanceMultiplier = 8 * 100000;
const DistanceMin = 24;
const DistanceMax = 64;

const ColorDistanceMultiplier = 4 * 10000;
const ColorAliveLightness = 50;
const ColorDeadLightness = 80;

async function featureInit() {
    await featureAddRandom();
}

function featureAdd(feature, fromFeature, distance) {
    if (Features.has(feature.id)) { return; }

    feature.hue = fromFeature == undefined ? (Math.random() * 361) : (fromFeature.hue + distance * ColorDistanceMultiplier);
    feature.dead = false;
    Features.set(feature.id, feature);
}

async function featureAddRandom() {
    const endPointRandom = `${baseApiPath}/random`;

    await fetch(endPointRandom)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Couldn't get ${endPointRandom}`);
            }
            return response.json();
        })
        .then(data => {
            featureAdd(data.feature);
            featureAddSimilar(data.feature);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function featureAddSimilar(sourceFeature) {
    let id = sourceFeature.id;
    let count = NumSimilarFeatures;
    let endPointSimilar = `${baseApiPath}/similar/${id}-${count}`;

    if (sourceFeature.dead) { return; }
    sourceFeature.dead = true;
    Features.set(sourceFeature.id, sourceFeature);

    await fetch(endPointSimilar)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Couldn't get ${endPointSimilar}`);
            }
            return response.json();
        })
        .then(data => {
            for (let i = 0; i < data.features.length; i++) {
                let distance = data.features[i].distance;
                let targetFeature = data.features[i].feature;
                
                featureAdd(targetFeature, sourceFeature, distance);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

//#endregion
//#region Init

featureInit();

//#endregion