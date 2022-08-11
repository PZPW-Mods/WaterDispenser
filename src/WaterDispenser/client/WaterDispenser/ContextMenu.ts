import { ArrayList, DrainableComboItem, getSpecificPlayer, getText, getTextManager, InventoryItem, ISContextMenu, IsoGridSquare, IsoPlayer, ISTimedActionQueue, ISToolTip, luautils, _instanceof_ } from "PipeWrench"
import { onFillWorldObjectContextMenu } from "PipeWrench-Events"
import { getGlobal } from "PipeWrench-Utils"
import { WaterDispenser } from "../../shared/WaterDispenser/WaterDispenser"
import { PlaceWaterJugAction } from "./TimedActions/PlaceWaterJugAction"
import { TakeWaterJugAction } from "./TimedActions/TakeWaterJugAction"

function doPlaceBottle(player: IsoPlayer, waterDispenser: WaterDispenser, waterJugItem: InventoryItem) {
    if (luautils.walkAdj(player, waterDispenser.IsoObject.getSquare(), false)) {
        ISTimedActionQueue.add(PlaceWaterJugAction(player, waterDispenser, waterJugItem))
    }
}

function doTakeBottle(player: IsoPlayer, waterDispenser: WaterDispenser) {
    if (luautils.walkAdj(player, waterDispenser.IsoObject.getSquare(), false)) {
        ISTimedActionQueue.add(TakeWaterJugAction(player, waterDispenser))
    }
}

onFillWorldObjectContextMenu.addListener((playerNum: number, context: ISContextMenu, _, test: boolean) => {
    if (test) return

    const player = getSpecificPlayer(playerNum)
    if (player.getVehicle()) return

    const clickedSquare = getGlobal("clickedSquare") as IsoGridSquare
    const waterDispenser = WaterDispenser.GetWaterDispenserOnSquare(clickedSquare)
    
    if (waterDispenser) {
        const inventory = player.getInventory()
        
        if (waterDispenser.Type === "None") {
            const waterJugs = new ArrayList()
            inventory.getAllTag("DispenserWaterJug", waterJugs)

            if (waterJugs.size() > 0) {
                const mainOption = context.addOptionOnTop(getText("ContextMenu_PlaceOnDispenser")) as ISContextMenu
                const mainContext = context.getNew(context) as ISContextMenu
                context.addSubMenu(mainOption, mainContext)

                for (let i = 0; i < waterJugs.size(); i++) {
                    const item = waterJugs.get(i) as InventoryItem
                    const percent = (_instanceof_(item, "DrainableComboItem")) ? (item as DrainableComboItem).getUsedDelta()  * 100 : 0
                    mainContext.addOption(item.getDisplayName() + ` (${luautils.round(percent, 2)}%)`, player, doPlaceBottle, waterDispenser, item)
                }
            }
        }
        else {
            context.addOptionOnTop(getText("ContextMenu_TakeBottleFromDispenser"), player, doTakeBottle, waterDispenser)
        }

        if (player.DistToSquared(waterDispenser.IsoObject.getX() + 0.5, waterDispenser.IsoObject.getY() + 0.5) < 8) {
            const mainOption = context.addOptionOnTop(getText("ContextMenu_Water_Dispenser"))
            const toolTip = new ISToolTip()
            toolTip.setName(getText("ContextMenu_Water_Dispenser"))
            const tx = getTextManager().MeasureStringX(toolTip.font, getText("ContextMenu_WaterName") + ":") + 20
            toolTip.description = string.format("%s: <SETX:%d> %d / %d", getText("ContextMenu_WaterName"), tx, waterDispenser.getWaterAmount(), 250)
            if (waterDispenser.getTainted()) {
                toolTip.description = toolTip.description + " <BR> <RGB:1,0.5,0.5> " + getText("Tooltip_item_TaintedWater")
            }
            toolTip.maxLineWidth = 512
            mainOption.toolTip = toolTip
        }

    }
})
