import { getSquare } from "@asledgehammer/pipewrench";
import { onClientCommand, onWaterAmountChange } from "@asledgehammer/pipewrench-events";
import { WaterDispenser } from "../../shared/WaterDispenser/WaterDispenser";

onWaterAmountChange.addListener((isoObject, waterAmount) => {
    const waterDispenser = WaterDispenser.GetWaterDispenserOnSquare(isoObject.getSquare())
    if (waterDispenser && waterDispenser.Type != "None" && waterDispenser.getWaterAmount() < 1) {
        waterDispenser.setNewType("Empty")
    }
})

onClientCommand.addListener((module, command, player, args) => {
    if (module !== "WaterDispenser") return

    const square = getSquare(args.x, args.y, args.z)
    const waterDispenser = WaterDispenser.GetWaterDispenserOnSquare(square)

    if (command == "PlaceBottle" && waterDispenser) {
        if (args.amount < 1) {
            waterDispenser.setNewType("Empty")
            waterDispenser.setWaterAmount(0)
            waterDispenser.setTainted(false)
        }
        else {
            waterDispenser.setNewType("Water")
            waterDispenser.setWaterAmount(args.amount)
            waterDispenser.setTainted(args.tainted)
        }
    }

    if (command == "TakeBottle" && waterDispenser) {
        waterDispenser.setNewType("None")
        waterDispenser.setWaterAmount(0)
        waterDispenser.setTainted(false)
    }
})
