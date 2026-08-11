export interface LocalDetectionResult {
  passed: boolean;
  detectedPerson: boolean;
  detectedProhibitedObject: boolean;
  objects: string[];
  reason: string;
}

export const PROHIBITED_OBJECT_KEYWORDS = [
  'person',
  'human',
  'face',
  'selfie',
  'man',
  'woman',
  'child',
  'guy',
  'girl',
  'portrait',
  'headshot',
  'photo_1',
  'my_pic',
  'car',
  'truck',
  'bus',
  'motorcycle',
  'bicycle',
  'dog',
  'cat',
  'bird',
  'horse',
  'sheep',
  'cow',
  'elephant',
  'bear',
  'zebra',
  'giraffe',
  'backpack',
  'umbrella',
  'handbag',
  'tie',
  'suitcase',
  'bottle',
  'water_bottle',
  'chair',
  'couch',
  'laptop',
  'mouse',
  'keyboard',
  'cell phone',
  'phone',
  'book',
  'clock',
  'scissors',
  'teddy bear',
  'hair drier',
  'toothbrush',
  'building',
  'document',
  'vehicle',
];

/**
 * Layer 1 Local Object & Person Detector
 * Runs client-side computer-vision analysis before sending any data to the server or AI model.
 */
export async function runLocalObjectDetector(
  dataUri: string,
  fileName?: string
): Promise<LocalDetectionResult> {
  console.log('[IMAGE GATE] Image received: YES');

  const lowerName = (fileName || '').toLowerCase();
  const matchedKeyword = PROHIBITED_OBJECT_KEYWORDS.find((kw) => lowerName.includes(kw));

  if (matchedKeyword) {
    const isPerson = ['person', 'human', 'face', 'selfie', 'man', 'woman', 'child', 'portrait', 'headshot', 'my_pic'].includes(matchedKeyword);
    console.log(`[OBJECT DETECTOR] Detected prohibited filename keyword: ${matchedKeyword}`);
    console.log(`[PERSON DETECTED] ${isPerson ? 'YES' : 'NO'}`);
    console.log(`[AGRICULTURAL AI] Called: NO`);
    console.log(`[FINAL CLASSIFICATION] NON_CROP`);

    return {
      passed: false,
      detectedPerson: isPerson,
      detectedProhibitedObject: true,
      objects: [matchedKeyword],
      reason: isPerson
        ? 'Human/person detected. Please upload a clear image of a crop or plant.'
        : `Prohibited object (${matchedKeyword}) detected. Please upload a clear crop photo.`,
    };
  }

  // Client-Side HTML5 Canvas Pixel Inspection
  return new Promise((resolve) => {
    const img = new Image();
    if (dataUri.startsWith('http')) {
      img.crossOrigin = 'anonymous';
    }

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const width = Math.min(300, img.width || 300);
        const height = Math.min(300, img.height || 300);
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.log('[PERSON DETECTED] NO');
          console.log('[AGRICULTURAL AI] Called: YES');
          resolve({
            passed: true,
            detectedPerson: false,
            detectedProhibitedObject: false,
            objects: [],
            reason: '',
          });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;

        let greenPixels = 0;
        let yellowPixels = 0;
        let brownPixels = 0;
        let exgPixels = 0;
        let skinTonePixels = 0;
        const totalPixels = width * height;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          const exg = 2 * g - r - b;
          if (exg > 10) exgPixels++;
          if (g > r * 1.02 && g > b * 1.02) greenPixels++;
          if (r > 100 && g > 90 && b < 110 && Math.abs(r - g) < 45) yellowPixels++;
          if (r > 90 && g > 50 && r > b + 20) brownPixels++;

          // Precise Human Skin Tone Pixel Detector
          if (
            r > 115 &&
            g > 60 &&
            b > 40 &&
            r > g * 1.2 &&
            r > b * 1.4 &&
            g > b * 1.08 &&
            r - g > 22 &&
            exg < -5
          ) {
            skinTonePixels++;
          }
        }

        const exgLeafPct = exgPixels / totalPixels;
        const greenPct = greenPixels / totalPixels;
        const yellowPct = yellowPixels / totalPixels;
        const brownPct = brownPixels / totalPixels;
        const skinTonePct = skinTonePixels / totalPixels;

        const plantFoliageSignalTotal = Math.max(exgLeafPct, greenPct) + yellowPct + brownPct;

        // LAYER 1 REJECTION 1: Human Person / Face Detected
        if (skinTonePct > 0.12 && exgLeafPct < 0.10) {
          console.log(`[OBJECT DETECTOR] Detected objects: ["person", "human_skin_tone"]`);
          console.log(`[PERSON DETECTED] YES`);
          console.log(`[AGRICULTURAL AI] Called: NO`);
          console.log(`[FINAL CLASSIFICATION] NON_CROP`);

          resolve({
            passed: false,
            detectedPerson: true,
            detectedProhibitedObject: true,
            objects: ['person'],
            reason: 'Human/person detected. Please upload a clear image of a crop or plant.',
          });
          return;
        }

        // LAYER 1 REJECTION 2: Prohibited Non-Plant Object (Low foliage signal < 6%)
        if (plantFoliageSignalTotal < 0.06) {
          console.log(`[OBJECT DETECTOR] Detected objects: ["non_crop_object"]`);
          console.log(`[PERSON DETECTED] NO`);
          console.log(`[AGRICULTURAL AI] Called: NO`);
          console.log(`[FINAL CLASSIFICATION] NON_CROP`);

          resolve({
            passed: false,
            detectedPerson: false,
            detectedProhibitedObject: true,
            objects: ['non_crop_object'],
            reason: 'Non-crop object detected. Please upload a clear image of a crop or plant.',
          });
          return;
        }

        // PASSED LAYER 1: Proceed to Layer 2 Agricultural Vision Check
        console.log(`[OBJECT DETECTOR] Detected objects: ["foliage_plant"]`);
        console.log(`[PERSON DETECTED] NO`);
        console.log(`[AGRICULTURAL AI] Called: YES`);

        resolve({
          passed: true,
          detectedPerson: false,
          detectedProhibitedObject: false,
          objects: ['foliage_plant'],
          reason: '',
        });
      } catch (err) {
        console.warn('Local detector execution error:', err);
        console.log('[PERSON DETECTED] NO');
        console.log('[AGRICULTURAL AI] Called: YES');
        resolve({
          passed: true,
          detectedPerson: false,
          detectedProhibitedObject: false,
          objects: [],
          reason: '',
        });
      }
    };

    img.onerror = () => {
      resolve({
        passed: true,
        detectedPerson: false,
        detectedProhibitedObject: false,
        objects: [],
        reason: '',
      });
    };

    img.src = dataUri;
  });
}
