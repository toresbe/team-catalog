import { css } from "@emotion/css"
import { BodyShort, Heading } from "@navikt/ds-react"
import { Link } from "react-router-dom"
import { Member } from "../../constants"
import greyBackground from '../../resources/greyBackground.svg'
import { intl } from "../../util/intl/intl"
import { UserImage } from "../common/UserImage"

const cardStyles = css`
    height: 151px;
    width: 435px;
    border: 1px solid #005077;
    border-radius: 8px;
    display: grid;
    grid-template-columns: 1fr 0.3fr;
    margin-bottom: 1rem;
`
const headingStyles = css`
    font-family: 'Inter';
    font-style: normal;
    font-weight: 600;
    font-size: 22px;
    line-height: 24px;
    color: #005077;
`

const imageDivStyles = css`
    right: 8px;
    top: 30px;
    position: absolute;
    text-align: right;
`

const CardMemberNew = (props: {member: Member}) => (
    <div className={cardStyles}>
        <div className={css`height: 100%; padding-left: 20px;`}>
            <Link to={`/resource/${props.member.navIdent}`} className={css`text-decoration: none;`}>
                <Heading size="medium" className={headingStyles}>{props.member.resource.fullName}</Heading>
            </Link>
            <div className={css` margin-top: 1.5rem;`}>
                <div className={css`margin-bottom: 5px;`}>Roller</div> <div><b>{props.member.roles.map((r) => intl[r]).join(', ')}</b></div>
            </div>
        </div>

        <div className={css`position: relative;`}>
            <img src={greyBackground} className={css`z-index: -1;`} />
            <div className={imageDivStyles}><UserImage ident={props.member.navIdent} size="100px" /></div>            
        </div>    
    </div>
)

export default CardMemberNew


