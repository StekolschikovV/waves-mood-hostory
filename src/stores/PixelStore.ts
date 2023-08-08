import {makeAutoObservable, toJS} from "mobx";
import {RootStore} from "@/stores/RootStore";
import axios from "axios";
import {IBlockchainData, IPixelState} from "@/interface";
import {InvokeArgs, Signer} from "@waves/signer";
import {ProviderKeeper} from "@waves/provider-keeper";

export class PixelStore {

    root: RootStore;
    data: IPixelState[] = []
    lastDataTime = 0

    state: Map<string, string> = new Map()
    stateNew: Map<string, string> = new Map()

    color = "red"

    needUpdatePixel = 0

    constructor(root: RootStore) {
        this.root = root;
        makeAutoObservable(this)
        this.load()

        // @ts-ignore
        window.xxx = this
    }

    public addNewPixel = (name: string, color: string) => {
        this.stateNew.set(name, color)
    }

    public travelToTime = (time: number): void => {
        this.state = this.getSliceFromTime(time)
        this.needUpdatePixel = this.needUpdatePixel + 1
    }

    public saveNewToBlockchain = async (selectedToken: "USDT" | "USDC") => {
        let newData: any[] = []
        const stateNewClone = this.stateNew
        this.stateNew.forEach((value, key, map) => {
            // console.log(`m[${key}] = ${value}`);
            const arr = key.split("-")
            const y = Math.abs(+arr[1] - 99)
            const x = Math.abs(+arr[0])
            newData.push({
                type: 'string',
                value: `${value}-${y}-${x}`
            })
        })
        console.log(newData)
        let USDTWXG = "34N9YcEETLWn93qYQ64EsP1x89tSruJU44RrEMSXXEPJ"
        let USDCWXG = "6XtHjpXbs9RRJP2Sr9GUyVqzACcby9TkThHXnjVC5CDJ"
        const data: InvokeArgs = {
            dApp: "3PAmW4yzC5W9paLoBUN1K5CZU4dfMM4fkWE",
            fee: 500000,
            payment: [{
                assetId: selectedToken === "USDT" ? USDTWXG : USDCWXG,
                amount: 10000 * this.stateNew.size,
            }],
            call: {
                function: 'draw',
                args: [
                    {
                        type: "list",
                        value: newData
                    }
                ]
            },
        }

        const signer = new Signer({
            NODE_URL: 'https://nodes.wavesnodes.com',
        });
        const keeper = new ProviderKeeper();
        signer.setProvider(keeper);

        // setIsWithUpdate(true)
        await signer
            .invoke(data)
            .broadcast()
            .then(e => {
                // if (e && e[0]?.type === 16) {
                //     toastWrapper('Request sent successfully!')
                // } else {
                //     toastWrapper('An error occurred, please check your wallet!')
                // }
                this.waitNewPixels(stateNewClone)
            })
            .catch((e) => {
                console.log(e)
                // console.log("error", e)
                // if (e?.message?.includes("WavesKeeper is not installed.. This is not error of signer")) {
                //     toastWrapper("WavesKeeper not found! You need to install a WavesKeeper to use the app!")
                // } else {
                //     toastWrapper(e?.message)
                // }
                // setSelectedPixelNew([])
            })
        // setTimeout(() => {
        //     setSelectedPixelNew([])
        //     scrollRight()
        //     setIsWithUpdate(false)
        // }, 7000)
    }

    private waitNewPixels = (stateNewClone: Map<string, string>) => {
        setTimeout(() => {
            let updateCount = 0
            stateNewClone.forEach((value, key, map) => {
                if (this.stateNew.get(key) === value) {
                    updateCount = updateCount + 1
                }
            })
            if (stateNewClone.size !== updateCount) {
                this.waitNewPixels(stateNewClone)
            } else {
                this.stateNew = new Map()
            }
        }, 3000)
    }


    private load = async () => {
        this.data = await axios
            .get("https://nodes.wavesnodes.com/addresses/data/3PAmW4yzC5W9paLoBUN1K5CZU4dfMM4fkWE")
            .then(e => e.data as IBlockchainData[])
            .then(e => e.filter(e => e.key.includes("log_")))
            .then((e: IBlockchainData[]) => {
                return e.map(ee => {
                    return {
                        time: +ee.key.split("_")[1],
                        pixels: ee.value.split("|").map(eee => {
                            return {
                                color: eee.split("-")[0],
                                y: +eee.split("-")[2],
                                x: 99 - +eee.split("-")[1]
                            }
                        })
                    }
                })
            })
            .catch(e => {
                console.log(e)
                return []
            })
        this.lastDataTime = this.data[this.data.length - 1].time
        this.state = this.getSliceFromTime(this.lastDataTime)

        this.needUpdatePixel += 1
    }

    private getSliceFromTime = (time: number): Map<string, string> => {
        const validData = this.data.filter(p => p.time <= time).map(e => toJS(e)).reverse()
        const map: Map<string, string> = new Map();
        validData.forEach(e => {
            e.pixels.forEach(p => {
                if (!map.get(`${p.y}-${p.x}`)) {
                    map.set(`${p.y}-${p.x}`, p.color)
                }
            })
        })
        return map
    }


}
