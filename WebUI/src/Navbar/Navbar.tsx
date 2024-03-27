import { cx } from "../util"
import util from "../util.module.css"
import logo from "../assets/logo.png"
import styles from "./Navbar.module.css"

export interface INavbar
{

}

export function Navbar(props: INavbar)
{
    return (
        <nav className={cx(util.z_10)}>
            <div className="nav-wrapper">
                <div className='container'>
                    <span className={cx("brand-logo center", util.full_height)}>
                        <div className={cx(util.flex_row, util.full_height)}>
                            <img src={logo} className={util.full_height}/>
                            Omnizart UI
                        </div>
                    </span>

                    <ul id="nav-mobile" className="right">
                        <li><a className={styles.disabled_link} href="#">&nbsp;</a></li>
                    </ul>
                </div>
            </div>
        </nav>
    )
}