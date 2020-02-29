import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { HttpsError } from 'firebase-functions/lib/providers/https'
import { Level, Topic, LevelType, Progress, BundleStat } from './types'
import { generateBundle } from './BundleGenerator'
import { user } from 'firebase-functions/lib/providers/auth'

admin.initializeApp()
const db = admin.firestore()

exports.getExerciseBundle = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (context.auth === undefined)
        throw new HttpsError('unauthenticated', 'Request has invalid credantials.')

    const topicPath: string = data.topic
    const uid = context.auth.uid
    return getUserProgress(uid)
        .then(userProgress => {
            const topicProgress = userProgress[topicPath]
            if (topicProgress === undefined)
                throw new HttpsError('invalid-argument', 'User progress of topic with path ' + topicPath + ' is null.')
            if (topicProgress.completed === -1)
                throw new HttpsError('invalid-argument', 'Topic was already finished.')
            else if (topicProgress.completed >= 100)
                throw new HttpsError('invalid-argument', 'All exercises in topic was already finished. You should request Exam.')

            return getLevel(topicPath, topicProgress, uid)
                .then(level => {
                    const bundle = generateBundle(level)
                    return bundle
                })
        }).catch(err => {
            throw new HttpsError('unknown', '[Firestore] Cant get user. ' + err)
        })
})

exports.getUserProgress = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (context.auth === undefined)
        throw new HttpsError('unauthenticated', 'Request has invalid credantials.')

    const uid = context.auth.uid


    return await getUserProgress(uid)
})

exports.sendBundleStats = functions.region('europe-west1').https.onCall((data: BundleStat, context) => {
    if (context.auth === undefined)
        throw new HttpsError('unauthenticated', 'Request has invalid credantials.')

    const uid = context.auth.uid

    if (data.answers === undefined || data.bundleId === undefined || data.isExam === undefined || data.topicPath === undefined)
        throw new HttpsError('invalid-argument', 'Request has invalid parameters')


    db.collection('users').doc(uid).get().then(userSnapshot => {
        var userData = userSnapshot.data()
        if (userData === undefined)
            throw new HttpsError('unknown', 'User not found')
        userData.Progress[data.topicPath].completed++
        let levelStats = (userData["levelStats"] as Array<any> || [])
        levelStats.push(data)
        userData["levelStats"] = levelStats

        db.collection('users').doc(uid).set(userData).then().catch()
    }).catch(e => {
        throw new HttpsError('unknown', '[Firestore] Cant get user')
    })


})

async function getUserProgress(uid: string) {
    const users = db.collection('users')

    const userSnapshot = await users.doc(uid).get()
    let data = userSnapshot.data()
    if (data === undefined)
        return createUserProgress(uid)

    let progress = data.Progress
    if (progress === undefined)
        return createUserProgress(uid)

    return progress
}

// it can be used for exercise and for exams both
function getLevel(topicPath: string, progress: Progress, uid: string, levelType: LevelType = LevelType.Exercise): Promise<Level> {
    const topicDoc = db.doc(topicPath)

    return topicDoc.get()
        .then(topicSnapshot => {
            const topicData = topicSnapshot.data() as Topic
            if (topicData === undefined)
                throw new HttpsError('invalid-argument', 'Cant find topic with path ' + topicPath)

            if (progress.totalExams != topicData.ExamsSequence.length || progress.totalExercise != topicData.ExercisesSequence.length)
                updateProgress(uid, topicData, topicPath).then().catch()

            let sequence;
            let localProgress;
            if (levelType == LevelType.Exercise) {
                sequence = topicData.ExercisesSequence
                localProgress = progress.completed
            }
            else {
                sequence = topicData.ExamsSequence
                localProgress = progress.completed - 100
            }

            if (localProgress >= sequence.length)
                throw new HttpsError('invalid-argument', 'Count of levels in sequence is less than requested progress.') // TODO: find out better solution

            const levelName = sequence[localProgress]
            return topicDoc.collection('levels').doc(levelName).get()
                .then(levelSnapshot => {
                    if (!levelSnapshot.exists)
                        throw new HttpsError('not-found', 'Level with name ' + levelName + ' doesnt exist.')

                    return levelSnapshot.data() as Level
                })
                .catch(err => {
                    throw new HttpsError('unknown', '[Firestore] Cant get level. ' + err)
                })
        })
        .catch(err => {
            throw new HttpsError('unknown', '[Firestore] Cant get topic.' + err)
        })
}

// Check for correctness
async function updateProgress(uid: string, topicData: Topic, topicPath: string) {
    const fieldName = 'Progress.' + topicPath
    const updateObject = {} as any
    updateObject[fieldName + '.totalExams'] = topicData.ExamsSequence.length
    updateObject[fieldName + '.totalExercise'] = topicData.ExercisesSequence.length

    db.collection('users').doc(uid).update(updateObject).then().catch()
}

async function createUserProgress(uid: string) {
    const topicConceptsSnapshot = await db.doc('/Subjects/Mechanics/Branches/Kinematics/Chapters/ProgressiveMovement/Topics/Concepts').get()
    const topicGraphsSnapshot = await db.doc('/Subjects/Mechanics/Branches/Kinematics/Chapters/ProgressiveMovement/Topics/Graphs').get()
    const topicConceptsProgress: Progress = {
        completed: 0,
        totalExercise: topicConceptsSnapshot.data()!!.ExercisesSequence.length,
        totalExams: topicConceptsSnapshot.data()!!.ExamsSequence.length
    }
    const topicGraphsProgress: Progress = {
        completed: 0,
        totalExercise: topicGraphsSnapshot.data()!!.ExercisesSequence.length,
        totalExams: topicGraphsSnapshot.data()!!.ExamsSequence.length
    }
    const data =
    {
        Progress: {
            '/Subjects/Mechanics/Branches/Kinematics/Chapters/ProgressiveMovement/Topics/Concepts': topicConceptsProgress,
            '/Subjects/Mechanics/Branches/Kinematics/Chapters/ProgressiveMovement/Topics/Graphs': topicGraphsProgress,
        }
    }

    db.collection('users').doc(uid).set(data, { merge: true }).then().catch()

    return data.Progress
}