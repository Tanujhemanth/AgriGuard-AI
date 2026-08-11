import { runLocalObjectDetector } from '../src/lib/localDetector';
import { analyzeCropImage } from '../src/lib/aiVision';

async function runTwoLayerGateTests() {
  console.log('--- STARTING COMPREHENSIVE TWO-LAYER IMAGE GATE AUDIT ---');

  // TEST 1: Human Face
  console.log('\n[TEST 1] Testing Human Face Image...');
  const gate1 = await runLocalObjectDetector('data:image/jpeg;base64,' + 'A'.repeat(200), 'human_face.jpg');
  console.log('Layer 1 Passed:', gate1.passed);
  console.log('Detected Person:', gate1.detectedPerson);
  if (gate1.passed) {
    throw new Error('TEST 1 FAILED: Human face bypassed Layer 1 Object Detector Gate!');
  }

  // TEST 2: Full Human / Person
  console.log('\n[TEST 2] Testing Full Human / Person Photo...');
  const gate2 = await runLocalObjectDetector('data:image/jpeg;base64,' + 'B'.repeat(200), 'portrait_person.jpg');
  console.log('Layer 1 Passed:', gate2.passed);
  console.log('Detected Person:', gate2.detectedPerson);
  if (gate2.passed) {
    throw new Error('TEST 2 FAILED: Person photo bypassed Layer 1 Object Detector Gate!');
  }

  // TEST 3: Phone Image
  console.log('\n[TEST 3] Testing Cell Phone Image...');
  const gate3 = await runLocalObjectDetector('data:image/jpeg;base64,' + 'C'.repeat(200), 'smartphone.jpg');
  console.log('Layer 1 Passed:', gate3.passed);
  if (gate3.passed) {
    throw new Error('TEST 3 FAILED: Phone image bypassed Layer 1 Object Detector Gate!');
  }

  // TEST 4: Dog / Cat Image
  console.log('\n[TEST 4] Testing Dog / Animal Photo...');
  const gate4 = await runLocalObjectDetector('data:image/jpeg;base64,' + 'D'.repeat(200), 'dog_photo.jpg');
  console.log('Layer 1 Passed:', gate4.passed);
  if (gate4.passed) {
    throw new Error('TEST 4 FAILED: Dog photo bypassed Layer 1 Object Detector Gate!');
  }

  // TEST 5: Clear Crop Leaf
  console.log('\n[TEST 5] Testing Clear Crop Leaf...');
  const cropLeafFeatures = {
    fileName: 'unlabelled_crop_leaf.jpg',
    skinTonePct: 0.01,
    exgLeafPct: 0.45,
    greenPct: 0.50,
    yellowPct: 0.05,
    brownPct: 0.02,
    aspectRatio: 1.2,
    luminance: 115,
    variance: 50,
  };
  const res5 = await analyzeCropImage('data:image/jpeg;base64,' + 'E'.repeat(200), cropLeafFeatures);
  console.log('Layer 2 Final Classification:', res5.classification);
  console.log('Crop Name:', res5.cropName);
  if (res5.classification !== 'CROP') {
    throw new Error('TEST 5 FAILED: Clear crop leaf was rejected!');
  }

  // TEST 6: Diseased Crop Leaf
  console.log('\n[TEST 6] Testing Diseased Rice Paddy Leaf...');
  const diseasedFeatures = {
    fileName: 'rice_paddy_leaf.jpg',
    skinTonePct: 0.01,
    exgLeafPct: 0.45,
    greenPct: 0.50,
    yellowPct: 0.05,
    brownPct: 0.12,
    aspectRatio: 2.1,
    luminance: 110,
    variance: 55,
  };
  const res6 = await analyzeCropImage('data:image/jpeg;base64,' + 'F'.repeat(200), diseasedFeatures);
  console.log('Layer 2 Final Classification:', res6.classification);
  console.log('Crop Name:', res6.cropName);
  console.log('Condition:', res6.conditionName);
  if (res6.classification !== 'CROP' || res6.cropName !== 'Rice') {
    throw new Error('TEST 6 FAILED: Diseased crop leaf was rejected!');
  }

  // TEST 7: Healthy Crop Leaf
  console.log('\n[TEST 7] Testing Healthy Green Crop Leaf...');
  const healthyFeatures = {
    fileName: 'healthy_green_foliage.jpg',
    skinTonePct: 0.01,
    exgLeafPct: 0.40,
    greenPct: 0.45,
    yellowPct: 0.02,
    brownPct: 0.01,
    luminance: 115,
    variance: 50,
  };
  const res7 = await analyzeCropImage('data:image/jpeg;base64,' + 'G'.repeat(200), healthyFeatures);
  console.log('Layer 2 Final Classification:', res7.classification);
  console.log('Crop Name:', res7.cropName);
  console.log('Condition:', res7.conditionName);
  if (res7.classification !== 'CROP') {
    throw new Error('TEST 7 FAILED: Healthy crop leaf was rejected!');
  }

  console.log('\n✅ ALL 7 TWO-LAYER IMAGE GATE AUDIT TESTS PASSED 100%!\n');
}

runTwoLayerGateTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
