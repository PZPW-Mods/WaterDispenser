import { DrainableComboItem, InventoryItem, ISBaseTimedAction, ISLogSystem, IsoPlayer, ISTimedActionQueue, Metabolics, sendClientCommand, _instanceof_ } from "PipeWrench"
import { WaterDispenser } from "../../../shared/WaterDispenser/WaterDispenser"

export function TakeWaterJugAction(character: IsoPlayer, waterDispenser: WaterDispenser) {
    const action = new ISBaseTimedAction(character)
    action.Type = "TakeWaterJugAction"
    action.stopOnAim = true
    action.stopOnRun = true
    action.stopOnWalk = true
    action.maxTime = 20 + 280 * waterDispenser.getWaterAmount() / 250

    const inventory = character.getInventory()

    // isValid
    action.isValid = () => {
        return waterDispenser.IsoObject && waterDispenser.Type != "None"
    }

    // start
    action.start = () => {
        action.setActionAnim("Loot")
    }

    // update
    action.update = () => {
        character.faceThisObject(waterDispenser.IsoObject)
        character.setMetabolicTarget(Metabolics.LightDomestic)
    }

    // stop
    action.stop = () => {
        ISTimedActionQueue.getTimedActionQueue(character).resetQueue()
    }

    // perform
    action.perform = () => {

        const itemType = (waterDispenser.getWaterAmount() > 0) ? "WaterDispenser.WaterJugWaterFull" : "WaterDispenser.WaterJugEmpty"
        const waterJugItem = inventory.AddItem(itemType) as InventoryItem
        if (_instanceof_(waterJugItem, "DrainableComboItem")) {
            const drainable = waterJugItem as DrainableComboItem
            drainable.setUsedDelta(waterDispenser.getWaterAmount() / 250)
            drainable.setTaintedWater(waterDispenser.getTainted())
        }

        const args = {
            x: waterDispenser.IsoObject.getX(),
            y: waterDispenser.IsoObject.getY(),
            z: waterDispenser.IsoObject.getZ(),
        }
        sendClientCommand(character, 'WaterDispenser', 'TakeBottle', args)

        ISTimedActionQueue.getTimedActionQueue(character).onCompleted(action)
        ISLogSystem.logAction(action)
    }

    return action
}
