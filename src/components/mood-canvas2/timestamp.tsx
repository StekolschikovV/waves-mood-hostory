import {observer} from "mobx-react-lite";
import {useRootStore} from "@/providers/RootStoreProvider";
import React, {useEffect, useRef, useState} from "react";
import {Text} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {Group} from "three";
import gsap from "gsap";
import moment from "moment";

const TimestampText =
    ({i, datePosition, timePosition, rotation, time}: {
        i: number,
        datePosition: [number, number, number],
        timePosition: [number, number, number],
        rotation: [number, number, number],
        time: number
    }) => {

        const store = useRootStore();
        const hhMM = moment(new Date(time)).format('hh:mm');
        const ddMM = moment(new Date(time)).format('DD/MM/YY');

        return <>
            <Text
                position={datePosition}
                rotation={rotation}
                color={store.pixelStore3.getRandomColor(i)}
                scale={[6, 6, 10]}
                anchorX="center"
                anchorY="middle">
                {ddMM}
            </Text>
            <Text
                position={timePosition}
                rotation={rotation}
                scale={[10, 10, 10]}
                color={store.pixelStore3.getRandomColor(i)}
                anchorX="center" anchorY="middle">
                {hhMM}
            </Text>
        </>
    }

export default observer(function Timestamp({i, time}: { i: number, time: number }) {

    const store = useRootStore();
    const ref = useRef<Group>(null!);

    useFrame(() => {

    });

    const [inInit, setIsInit] = useState(false)
    useEffect(() => {


        let z = -Math.abs((i - store.pixelStore3.selectedTimestamp) * 20) / (10 / Math.abs((i - store.pixelStore3.selectedTimestamp)))
        // let x = i + store.pixelStore3.selectedTimestamp
        // let z = -Math.abs((i - store.pixelStore3.selectedTimestamp) * 20)
        // let x = ((i - store.pixelStore3.selectedTimestamp) * 40)
        let x = ((i - store.pixelStore3.selectedTimestamp) * 30)
        // let y = ((i - store.pixelStore3.selectedTimestamp / 2) - i)
        let y = -75 + (Math.abs(z / 2) * 1)

        console.log(z, Math.abs(z) / 100)

        if (store.pixelStore3.data.length > 0) {
            if (inInit) {

                gsap.to(ref.current.position, {y, z, x, duration: 5});
            } else {
                setIsInit(true)
                ref.current.position.x = x
                ref.current.position.y = y
                ref.current.position.z = z
            }
        }


    }, [store.pixelStore3.selectedTimestamp])


    const textData:
        {
            datePosition: [number, number, number],
            timePosition: [number, number, number],
            rotation: [number, number, number]
        }[]
        = [
        // {datePosition: [-20.1, 5, 20], timePosition: [-20.1, -4, 20], rotation: [-Math.PI, (Math.PI * 1.5), Math.PI]},
        // {datePosition: [20.1, 5, 20], timePosition: [20.1, -4, 20], rotation: [Math.PI, (Math.PI / 2), Math.PI]},
        // {datePosition: [0, 5, -0.1], timePosition: [0, -4, -0.1], rotation: [-Math.PI * 3, Math.PI * 2, Math.PI]},
        // {datePosition: [0, 20.1, 26], timePosition: [0, 20.1, 16], rotation: [-Math.PI / 2, 0, 0]},
        // {datePosition: [0, -20.1, 16], timePosition: [0, -20.1, 26], rotation: [-Math.PI * 1.5, 0, 0]},
        {datePosition: [0, 3, 40.1], timePosition: [0, -6, 40.1], rotation: [0, 0, 0]}
    ]

    return <>
        <group
            onClick={() => {
                if (store.pixelStore3.isAnimationFinish === true) {
                    store.pixelStore3.isAnimationFinish = false
                    store.pixelStore3.selectedTimestamp = i
                    store.pixelStore3.travelToTime(time)
                    setTimeout(() => {
                        store.pixelStore3.isAnimationFinish = true
                    }, 6000)
                }
            }}
            scale={[0.3, 0.3, 0.3]}
            ref={ref}
            position={[0, -50, 0]}

        >

            {textData.map((e, ii) =>
                <TimestampText
                    key={ii}
                    i={i}
                    time={time}
                    datePosition={e.datePosition}
                    timePosition={e.timePosition}
                    rotation={e.rotation}/>
            )}


            <mesh
                position={[0, 0, 20]}
                scale={[40, 40, 40]}
                material={store.pixelStore3.timestampMaterial}
                geometry={store.pixelStore3.geometry}>

            </mesh>
        </group>


        {/*<mesh*/}
        {/*    ref={ref}*/}
        {/*    // position={[0, 0, 80]}*/}

        {/*    position={position}*/}
        {/*>*/}
        {/*    <boxGeometry*/}
        {/*        // args={[10, 10, 12]}*/}
        {/*        args={size}*/}
        {/*    />*/}
        {/*    <meshPhysicalMaterial*/}
        {/*        color="white"*/}
        {/*        transparent // Включение прозрачности*/}
        {/*        opacity={0.4} // Уровень прозрачности (0 - полностью прозрачный, 1 - непрозрачный)*/}
        {/*        side={DoubleSide} // Отображение материала с обеих сторон грани*/}
        {/*        // color="white"*/}
        {/*        // transmission={0.1} // Пропорция пропускания света через материал (0 - полное отражение, 1 - полное пропускание)*/}
        {/*        clearcoat={1} // Количество покрытия (clearcoat) для добавления реалистичных отражений*/}
        {/*        clearcoatRoughness={0.1} // "Шероховатость" покрытия*/}
        {/*        roughness={0.1} // Шероховатость основного материала*/}
        {/*        ior={1.25}*/}
        {/*        envMapIntensity={25}*/}
        {/*        thickness={20}*/}

        {/*    />*/}
        {/*<MeshTransmissionMaterial*/}
        {/*    clearcoat={1} samples={3}*/}
        {/*    thickness={40}*/}
        {/*    chromaticAberration={0.25}*/}
        {/*    anisotropy={0.4} distortionScale={0.2} temporalDistortion={0.2}/>*/}

        {/*</mesh>*/}
    </>
})