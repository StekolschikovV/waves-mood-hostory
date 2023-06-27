
import styles from "./style.module.scss"
import {useState} from "react";

export function Preloader({isShow = true}: {isShow:boolean}) {

    const [isHide, setIsHide] = useState(false)
    const [isFadeOut, setIsFadeOut] = useState(false)

    if (!isShow && !isFadeOut) {
        setIsFadeOut(true)
        setTimeout(() => {
            setIsHide(true)
        }, 500)
    }


    return <>
        {!isHide && <div className={`${styles.container} ${isFadeOut ? styles.isFadeOut : ""}`}>

            <div className={styles.innerContainer}></div>

        </div>}
        </>

}