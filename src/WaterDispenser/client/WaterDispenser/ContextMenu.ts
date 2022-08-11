import { getSpecificPlayer, ISContextMenu, IsoGridSquare, IsoObject } from "PipeWrench"
import { onFillWorldObjectContextMenu } from "PipeWrench-Events"
import { getGlobal } from "PipeWrench-Utils"
import { WaterDispenser } from "../../shared/WaterDispenser/WaterDispenser"

onFillWorldObjectContextMenu.addListener((playerNum: number, context: ISContextMenu, worldObjects: IsoObject[], test: boolean) => {
    if (test) return

    const player = getSpecificPlayer(playerNum)
    if (player.getVehicle()) return

    const clickedSquare = getGlobal("clickedSquare") as IsoGridSquare
    const waterDispenser = WaterDispenser.GetWaterDispenserOnSquare(clickedSquare)

    if (waterDispenser) {
        
    }
})
