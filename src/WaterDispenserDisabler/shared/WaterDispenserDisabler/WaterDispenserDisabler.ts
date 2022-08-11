import { getActivatedMods, isClient, IsoObject, isServer } from "PipeWrench"
import { loadGridSquare } from "PipeWrench-Events"

if (getActivatedMods().contains("WaterDispenser") === false) {

    loadGridSquare.addListener((square) => {
        if (isServer() || !isClient()) {
            const objects = square.getObjects()
            for (let i = 0; i < objects.size(); i++) {
                const object = objects.get(i) as IsoObject
                const modData = object.getModData()
                if (modData.waterDispenserInfo && modData.waterDispenserInfo.type !== "Vanilla") {
                    object.setSpriteFromName("location_business_office_generic_01_49")
                    if (isServer()) object.transmitUpdatedSpriteToClients()
                    modData.waterDispenserInfo = null
                    object.transmitModData()
                }
            }
        }
    })

}
