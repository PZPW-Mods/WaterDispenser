import { DrainableComboItem, InventoryItem, ISBaseTimedAction, ISLogSystem, IsoPlayer, ISTimedActionQueue, Metabolics, sendClientCommand, _instanceof_ } from "@asledgehammer/pipewrench"
import { WaterDispenser } from "../../../shared/WaterDispenser/WaterDispenser"

export function PlaceWaterJugAction(character: IsoPlayer, waterDispenser: WaterDispenser, waterJugItem: InventoryItem) {
    const action = new ISBaseTimedAction(character)
    action.Type = "PlaceWaterJugAction"
    action.stopOnAim = true
    action.stopOnRun = true
    action.stopOnWalk = true

    const usedDelta = ((_instanceof_(waterJugItem, "DrainableComboItem")) ? (waterJugItem as DrainableComboItem).getUsedDelta() : 0)

    action.maxTime = 20 + 280 * usedDelta

    const inventory = character.getInventory()

    // isValid
    action.isValid = () => {
        return waterDispenser.IsoObject && waterDispenser.Type == "None" && inventory.contains(waterJugItem)
    }

    // start
    action.start = () => {
        waterJugItem.setJobType("Placing")
        waterJugItem.setJobDelta(0)
        action.setActionAnim("Loot")
    }

    // update
    action.update = () => {
        waterJugItem.setJobDelta(action.getJobDelta())
        character.faceThisObject(waterDispenser.IsoObject)
        character.setMetabolicTarget(Metabolics.LightDomestic)
    }

    // stop
    action.stop = () => {
        waterJugItem.setJobDelta(0)

        ISTimedActionQueue.getTimedActionQueue(character).resetQueue()
    }

    // perform
    action.perform = () => {
        waterJugItem.setJobDelta(0)

        const args = {
            x: waterDispenser.IsoObject.getX(),
            y: waterDispenser.IsoObject.getY(),
            z: waterDispenser.IsoObject.getZ(),
            amount: 250 * usedDelta,
            tainted: waterJugItem.isTaintedWater()
        }
        sendClientCommand(character, 'WaterDispenser', 'PlaceBottle', args)

        inventory.Remove(waterJugItem)

        ISTimedActionQueue.getTimedActionQueue(character).onCompleted(action)
        ISLogSystem.logAction(action)
    }

    return action
}
