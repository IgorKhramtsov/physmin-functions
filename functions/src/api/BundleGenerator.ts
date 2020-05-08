import { getRStask as getRStask } from "./../Tasks/RS";
import { getG2Gtask as getG2Gtask } from "./../Tasks/G2G";
import { getS2Gtask as getS2Gtask } from "./../Tasks/S2G";
import { Level } from "./types";

const typeToTestFunc = { "G2G": getG2Gtask, "S2G": getS2Gtask, "RS": getRStask } as any

export function generateBundle(config: Level) {
    const tasks = Array()
    let task_i = 0
    config.tasks.forEach(task => {
        for (let i = 0; i < task.count; i++) {
            tasks.push(typeToTestFunc[task.type](task_i++, task.taskConfig))
        }
    })

    return {
        bundleId: Date.now().getRandom(),
        tasks: tasks
    };
}