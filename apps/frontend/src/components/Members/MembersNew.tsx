import { css } from "@emotion/css"
import { Member } from "../../constants"
import CardMemberNew from "./CardMemberNew"

const listStyles = css`
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
`

type MembersNewProps = {
    members: Member[]
}

const MembersNew = (props: MembersNewProps) => {
    const { members } = props

    return (
        <div className={listStyles}>
            {members.map((m: Member) => (<CardMemberNew  member={m} />))}
        </div>
    )
}

export default MembersNew