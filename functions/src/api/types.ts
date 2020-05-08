export type Topic = {
    ExercisesSequence: [],
    ExamsSequence: []
}

export type G2GConfig = {
    questionAxes: string[],
    answersAxes: string[],
    correctAnswersCount: number,
    answersCount: number,
    zeroAaxis: boolean
}

export type S2GConfig = {
    axes: string[],
    doubleGraphChance: number,
    answersCount: number,
    zeroAaxis: boolean
}

export type RSConfig = {
    isSimple: boolean
    axes: string[],
    answersCount: number,
    segmentsCount: number[],
    zeroAaxis: boolean
}

export type TaskConfig = {
    type: string,
    count: number,
    taskConfig: G2GConfig | S2GConfig | RSConfig
}

export type Level = {
    isExam: Boolean,
    tasks: TaskConfig[]
}

export enum LevelType {
    Exam,
    Exercise,
    Training
}

export type Progress = {
    completed: number,
    totalExercise: number,
    totalExams: number
}

export type BundleStat = {
    isExam: boolean,
    bundleId: string,
    payload: any,
    topicPath: string
}