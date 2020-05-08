export type Task = {
    type: string,
    taskID: number,
    question: Array<any> | any,
    answers: Array<any>,
    correctAnswersCount: number | undefined
}