import * as functions from 'firebase-functions';
import * as cors from 'cors';
import { UnitFirst } from './UnitFirst';
const corsHandler = cors({ origin: true });

exports.getTestDevDebug = functions.region("europe-west1").https.onRequest((request, resp) => {
  return corsHandler(request, resp, () => {
    resp.send(createTest());
  });
});

exports.getTestDev = functions.region("europe-west1").https.onCall((data, context) => {
  return createTest()
});

function createTest(): any {
  const testBundle = { tests: Array<any>() };

  // testBundle.tests.push(UnitFirst.getG2Gtest_OneAnswerGraph(1));
  // testBundle.tests.push(UnitFirst.getG2Gtest_TwoAnswerGraph(2));

  // testBundle.tests.push(UnitFirst.getG2Stest_SimpleFunctions(2));
  // testBundle.tests.push(UnitFirst.getG2Stest_ComplexFunctions(3));
  // testBundle.tests.push(UnitFirst.getG2Stest_MixedFunctions(4, 0.5));

  // testBundle.tests.push(UnitFirst.getSGtest_SimpleAnswers(6));
  testBundle.tests.push(UnitFirst.getSGtest_ComplexAnswers(7));
  return JSON.stringify(testBundle);
}
