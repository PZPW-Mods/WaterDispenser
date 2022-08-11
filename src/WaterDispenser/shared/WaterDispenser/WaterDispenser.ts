import { isClient, IsoGridSquare, IsoObject, isServer, ZombRand, _instanceof_ } from "PipeWrench"
import { loadGridSquare } from "PipeWrench-Events"

type Facing = "N" | "E" | "S" | "W"
type WaterDispenserType = "Vanilla" | "None" | "Empty" | "Water"

interface IWaterDispenser {
    [facing: string]: string
}

export class WaterDispenser {

    static readonly MaxWaterAmount = 250

    static readonly WaterDispenserTypes: {[type in WaterDispenserType]: IWaterDispenser} = {
        Vanilla: {
            N: "location_business_office_generic_01_57",
            E: "location_business_office_generic_01_48",
            S: "location_business_office_generic_01_49",
            W: "location_business_office_generic_01_56"
        },
        None: {
            N: "coco_liquid_overhaul_01_0",
            E: "coco_liquid_overhaul_01_1",
            S: "coco_liquid_overhaul_01_2",
            W: "coco_liquid_overhaul_01_3"
        },
        Empty: {
            N: "coco_liquid_overhaul_01_4",
            E: "coco_liquid_overhaul_01_5",
            S: "coco_liquid_overhaul_01_6",
            W: "coco_liquid_overhaul_01_7"
        },
        Water: {
            N: "coco_liquid_overhaul_01_8",
            E: "coco_liquid_overhaul_01_9",
            S: "coco_liquid_overhaul_01_10",
            W: "coco_liquid_overhaul_01_11"
        }
    }

    public get IsoObject() { return this.isoObject }
    private isoObject: IsoObject

    public get Facing() { return this.facing }
    private facing: Facing

    public get Type() { return this.type }
    private type: WaterDispenserType

    constructor(isoObject: IsoObject, facing: Facing, type: WaterDispenserType ) {
        this.isoObject = isoObject
        this.facing = facing
        this.type = type

        if (!this.isoObject.getModData().waterDispenserInfo) {
            this.isoObject.getModData().waterDispenserInfo = { type, facing }
        }
    }

    public setNewType(newType: WaterDispenserType) {
        const spriteName = WaterDispenser.WaterDispenserTypes[newType][this.facing]
        if (spriteName) {
            this.type = newType
            this.isoObject.getModData().waterDispenserInfo = {
                type: this.type,
                facing: this.facing
            }
            this.isoObject.setSpriteFromName(spriteName)
            if (isServer()) this.isoObject.transmitCompleteItemToClients()
            if (isClient()) this.isoObject.transmitCompleteItemToServer()
        }
    }

    public getWaterAmount(): number {
        return this.isoObject.getWaterAmount()
    }

    public setWaterAmount(amount: number) {
        this.isoObject.setWaterAmount(amount)
        this.isoObject.transmitModData()
    }

    public randomizeWaterAmount() {
        this.setWaterAmount(ZombRand(WaterDispenser.MaxWaterAmount))
    }

    public getTainted(): boolean {
        return this.isoObject.isTaintedWater()
    }

    public setTainted(tainted: boolean) {
        this.isoObject.setTaintedWater(tainted)
        this.isoObject.transmitModData()
    }

    /** @noSelf */
    public static GetWaterDispenserInfo(isoObject: IsoObject) {
        if (!_instanceof_(isoObject, "IsoObject")) return

        const sprite = isoObject.getSprite()
        if (sprite) {
            const spriteName = sprite.getName()
            for (const entry of Object.entries(WaterDispenser.WaterDispenserTypes)) {
                const type = entry[0] as WaterDispenserType
                const values = entry[1] as IWaterDispenser
                for (const facing of Object.keys(values)) {
                    if (values[facing] === spriteName) {
                        return { facing: facing as Facing, type }
                    }
                }
            }
        }
    }

    /** @noSelf */
    public static GetWaterDispenserOnSquare(isoSquare: IsoGridSquare): WaterDispenser | undefined {
        if (!_instanceof_(isoSquare, "IsoGridSquare")) return

        const objects = isoSquare.getObjects()
        for (let i = 0; i < objects.size(); i++) {
            const obj = objects.get(i)
            const info = WaterDispenser.GetWaterDispenserInfo(obj)
            if (info) {
                return new WaterDispenser(obj, info.facing, info.type)
            }
        }
    }
}

loadGridSquare.addListener((square) => {
    const waterDispenser = WaterDispenser.GetWaterDispenserOnSquare(square)

    if (waterDispenser && waterDispenser.Type === "Vanilla") {
        waterDispenser.setNewType("Water")
        waterDispenser.randomizeWaterAmount()
        waterDispenser.setTainted(false)
    }
})
