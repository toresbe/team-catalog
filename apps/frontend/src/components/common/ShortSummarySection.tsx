import { css } from "@emotion/css"
import { Heading } from "@navikt/ds-react"
import React from "react"
import { Cluster, ContactAddress, ProductArea, ProductTeam } from "../../constants"
import { intl } from "../../util/intl/intl"
import { BulletPointsList, TeamOwner } from "../Team/TeamMetadata"
import RouteLink from "./RouteLink"
import { TextWithLabel } from "./TextWithLabel"

const Divider = () => (
    <div className={css`height: 5px; background: #005077; margin-bottom: 3px;`}></div>
)

interface ShortSummaryProps {
    team: ProductTeam
    productArea?: ProductArea
    clusters: Cluster[]
    contactAddresses?: ContactAddress[]
}

const ShortSummarySection = (props: ShortSummaryProps) => {
    const { team, productArea, clusters, contactAddresses } = props
    const isPartOfDefaultArea = productArea?.defaultArea || false

    return (
        <div>
            <Heading size="medium" className={css`font-size: 22px; font-weight: 600;`}>Kort fortalt</Heading>
            <Divider />
            <div className={css`display: grid; grid-template-columns: 1fr;`}>
                {productArea && <TextWithLabel label="Område" text={<RouteLink href={`/area/${productArea.id}`}>{productArea.name}</RouteLink>} />}
                {isPartOfDefaultArea && <TeamOwner teamOwner={team.teamOwnerResource} />}

                {!!clusters?.length && (
                    <TextWithLabel
                        label="Klynger"
                        text={clusters.map((c, i) => (
                            <React.Fragment key={c.id + i}>
                            <RouteLink href={`/cluster/${c.id}`}>{c.name}</RouteLink>
                            {i < clusters.length - 1 && <span>, </span>}
                            </React.Fragment>
                        ))}
                    />
                )}

                <TextWithLabel label={'Teamtype'} text={team.teamOwnershipType ? intl.getString(team.teamOwnershipType) : intl.dataIsMissing} />
                <BulletPointsList label="Team på NAIS" list={!team.naisTeams ? [] : team.naisTeams} />
                <BulletPointsList label="Tagg" list={!team.tags ? [] : team.tags} baseUrl={'/tag/'} />

            </div>
        </div>
    )
}

export default ShortSummarySection