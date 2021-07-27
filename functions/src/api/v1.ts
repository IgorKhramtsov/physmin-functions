import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { HttpsError } from 'firebase-functions/lib/providers/https'
import { Level, Topic, LevelType, Progress, BundleStat, TaskConfig } from './types'
import { generateBundle } from './BundleGenerator'
import { user } from 'firebase-functions/lib/providers/auth'
import { Task } from '../Tasks/types'

admin.initializeApp()
const db = admin.firestore()

exports.getTopicBundle = functions.region('europe-west1').https.onCall(async (data, context) => {
    if (context.auth === undefined)
        throw new HttpsError('unauthenticated', 'Request has invalid credantials.')

    const topicPath: string = data.topic
    const requestingExam = data.isExam
    const uid = context.auth.uid
    return getUserProgress(uid)
        .then(userProgress => {
            const topicProgress = userProgress[topicPath]
            if (topicProgress === undefined)
                throw new HttpsError('invalid-argument', 'User progress of topic with path ' + topicPath + ' is null.')
            if (topicProgress.completed === -1)
                throw new HttpsError('invalid-argument', 'Topic was already finished.')
            else if (topicProgress.completed >= 100 && !requestingExam)
                throw new HttpsError('invalid-argument', 'All exercises in topic was already finished. You should request Exam.')
            else if (topicProgress.completed < 100 && requestingExam)
                throw new HttpsError('invalid-argument', 'Not all exercices completted') // This maybe reworked for externally completting

            return getLevel(topicPath, topicProgress, uid, requestingExam ? LevelType.Exam : LevelType.Exercise)
                .then(async level => {
                    const bundle = generateBundle(level)

                    if (!requestingExam)
                        return bundle

                    delete bundle.bundleId
                    const bundleId = await saveBundle(bundle)
                    const examBundle = processBundle(bundle)
                    examBundle.bundleId = bundleId
                    return examBundle
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

exports.sendAnswersBundle = functions.region('europe-west1').https.onCall(async (data: BundleStat, context) => {
    if (context.auth === undefined)
        throw new HttpsError('unauthenticated', 'Request has invalid credantials.')

    const uid = context.auth.uid

    if (data.payload === undefined || data.bundleId === undefined || data.isExam === undefined || data.topicPath === undefined)
        throw new HttpsError('invalid-argument', 'Request has invalid parameters')

    if (!data.isExam) {
        await storeUserAnswersBundle(uid, data, true).then().catch()
        return undefined
    }
    else {
        return db.collection("bundles").doc(data.bundleId).get().then(async bundleSnapshot => {
            let bundleData = bundleSnapshot.data()
            if (bundleData === undefined)
                throw new HttpsError('invalid-argument', 'Bundle not found. ');
            bundleData = JSON.parse(bundleData.bundle)

            const checkedAnswers = await checkUserAnswers(bundleData, data)
            const completness = checkedAnswers.correctAnswers / checkedAnswers.totalTasks

            // if user have more than 75% correct answers, mark as success
            storeUserAnswersBundle(uid, checkedAnswers.data, completness > 0.75).then().catch()
            return completness
        })

    }

})

/**
 * Add answersBundle to user levelStats array, incrementing user progress
 * @param uid user unique id
 * @param data answersBundle (with topic, isExam, bundle id)
 * @param shouldIncProgress if exam, update progress only if user have many correct answers
 */
async function storeUserAnswersBundle(uid: string, data: BundleStat, shouldIncProgress: Boolean) {
    db.collection('users').doc(uid).get().then(userSnapshot => {
        var userData = userSnapshot.data()
        if (userData === undefined)
            throw new HttpsError('unknown', 'User not found')
        userData.Progress[data.topicPath].completed++
        if (userData.Progress[data.topicPath].completed < 100 && userData.Progress[data.topicPath].completed >= userData.Progress[data.topicPath].totalExercise)
            userData.Progress[data.topicPath].completed = 100
        if (userData.Progress[data.topicPath].completed >= 100 && (userData.Progress[data.topicPath].completed - 100) >= userData.Progress[data.topicPath].totalExams)
            userData.Progress[data.topicPath].completed = -1

        let levelStats = (userData["levelStats"] as Array<any> || [])
        levelStats.push(data)
        userData["levelStats"] = levelStats

        db.collection('users').doc(uid).set(userData).then().catch()
    }).catch(e => {
        throw new HttpsError('unknown', '[Firestore] Cant get user')
    })
}

function checkUserAnswers(bundleData: any, data: BundleStat) {
    const data_copy = Object.assign({}, data as any) as BundleStat
    var totalTasks = 0;
    var correctAnswers = 0;

    (bundleData!!.tasks as Array<Task>).forEach((task: Task) => {
        const userTask = data_copy.payload[task.taskID]
        switch (task.type) {
            case "G2G":
                {
                    const correctids = task.question.correctIDs as Array<number>
                    const userAnswers = userTask.answers["0"] as Array<string>
                    userAnswers.forEach(answer => correctids.deleteItem(Number(answer)))
                    if (correctids.length == 0)
                        userTask.isCorrect = true
                    else
                        userTask.isCorrect = false
                }
                break
            case "S2G":
                {
                    const questions = task.question as Array<any>
                    userTask.isCorrect = true
                    questions.forEach((question: any) => {
                        const correctids = question.correctIDs
                        const questionID = question.id as number
                        const userAnswers = userTask.answers[questionID.toString()] as Array<string>
                        userAnswers.forEach(answer => correctids.deleteItem(Number(answer)))
                        if (correctids.length != 0)
                            userTask.isCorrect = false
                    })
                }
                break
            case "RS":
                {
                    const correctanswers = task.answers as Array<any>
                    const userAnswers = userTask.answers as Array<string>
                    userTask.isCorrect = true
                    correctanswers.forEach(answer => {
                        if (userAnswers[answer.id] != (answer.correctSign as number).toString())
                            userTask.isCorrect = false
                    })
                }
                break
        }

        if (userTask.isCorrect)
            correctAnswers++

        totalTasks++
    })
    return {
        data: data_copy,
        correctAnswers: correctAnswers,
        totalTasks: totalTasks
    }
}

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

async function updateProgress(uid: string, topicData: Topic, topicPath: string) {
    db.collection('users').doc(uid).get().then(userSnapshot => {
        var userData = userSnapshot.data()
        if (userData === undefined)
            throw new HttpsError('unknown', 'User not found')

        userData.Progress[topicPath].totalExams = topicData.ExamsSequence.length
        userData.Progress[topicPath].totalExercise = topicData.ExercisesSequence.length

        db.collection('users').doc(uid).set(userData).then().catch()
    }).catch(e => {
        throw new HttpsError('unknown', '[Firestore] Cant get user')
    })
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

async function saveBundle(bundle: any) {
    return db.collection("bundles").add({ bundle: JSON.stringify(bundle) }).then(bundleSpanshot => {
        return bundleSpanshot.id
    }).catch(e => {
        throw new HttpsError('unknown', '[Firestore] Cant create bundle document. ' + e)
    })
}

function processBundle(bundle: any) {
    const bundleCopy = Object.assign({}, bundle)

    const tasks = bundleCopy.tasks as Array<any>
    tasks.forEach(task => {
        if (task.type == "G2G")
            delete task.question["correctIDs"]
        else if (task.type == "S2G")
            (task.questions as Array<any>).forEach(question => {
                delete question["correctIDs"]
            });
        else if (task.type == "RS")
            (task.answers as Array<any>).forEach(answer => {
                delete answer["correctSign"]
            })
    })
    return bundleCopy
}