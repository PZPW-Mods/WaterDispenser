import { ISBaseTimedAction, ISLogSystem, IsoPlayer, ISTimedActionQueue } from "PipeWrench"

export function PlaceWaterJugAction(character: IsoPlayer) {
    const action = new ISBaseTimedAction(character)
    action.Type = "PlaceWaterJugAction"
    action.maxTime = 120
    action.stopOnAim = true
    action.stopOnRun = true
    action.stopOnWalk = true

    // isValid
    action.isValid = () => {
        return true
    }

    // start
    action.start = () => {

    }

    // update
    action.update = () => {

    }

    // stop
    action.stop = () => {
        print(`${action.Type} stopped`)
        ISTimedActionQueue.getTimedActionQueue(character).resetQueue()
    }

    // perform
    action.perform = () => {
        print(`${action.Type} performed`)

        ISTimedActionQueue.getTimedActionQueue(character).onCompleted(action)
        ISLogSystem.logAction(action)
    }

    return action
}
