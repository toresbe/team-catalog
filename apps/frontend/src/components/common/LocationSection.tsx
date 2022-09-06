import RouteLink from "./RouteLink"
import { css } from "@emotion/css"
import { Heading } from "@navikt/ds-react"
import { ContactAddress, ProductArea, ProductTeam } from "../../constants"
import { TextWithLabel } from "./TextWithLabel"
import { Block } from "baseui/block"
import { ParagraphMedium } from "baseui/typography"
import { SlackLink } from "./SlackLink"

import locationIcon from '../../resources/locationIcon.svg'
import officeDaysIcon from '../../resources/officeDaysIcon.svg'
import slackIcon from '../../resources/slackIcon.svg'

const Divider = () => (
    <div className={css`height: 5px; background: #005077; `}></div>
)

const rowStyling = css`
    display: flex;
`
const iconDivStyling = css`align-self: center; margin-right: 1rem;`

const displayOfficeHours = (days: string[], information?: string) => {
    return (
      <Block>
        <ParagraphMedium marginBottom="5px" marginTop="10px">
          {days.length > 0 ? days.map((d) => getDisplayDay(d)).join(', ') : 'Ingen planlagte kontordager'}
        </ParagraphMedium>
        {information && <ParagraphMedium marginTop="0px">{information}</ParagraphMedium>}
      </Block>
    )
}
export const getDisplayDay = (day: string) => {
    switch (day) {
      case 'MONDAY':
        return 'Mandag'
      case 'TUESDAY':
        return 'Tirsdag'
      case 'WEDNESDAY':
        return 'Onsdag'
      case 'THURSDAY':
        return 'Torsdag'
      case 'FRIDAY':
        return 'Fredag'
      default:
        break
    }
}

interface LocationSectionProps {
    team: ProductTeam
    productArea?: ProductArea
    contactAddresses?: ContactAddress[]
}
const LocationSection = (props: LocationSectionProps) => {
    const { team, productArea, contactAddresses } = props

    

    return (
        <div>
            <Heading size="medium" className={css`font-size: 22px; font-weight: 600;`}>Her finner du oss</Heading>
            <Divider />
            {team.officeHours && (
                <>
                    <div className={rowStyling}>
                        <div className={iconDivStyling}> <img src={locationIcon} alt="Lokasjon" /></div>
                        <TextWithLabel label={'Lokasjon'} text={<RouteLink href={`/location/${team.officeHours?.location.code}`}>{team.officeHours?.location.displayName}</RouteLink>} />
                    </div>

                    {team.officeHours.days && (
                        <div className={rowStyling}>
                          <div className={iconDivStyling}> <img src={officeDaysIcon} alt="Planlagte kontordager ikon" /></div>
                            <TextWithLabel label={'Planlagte kontordager'} text={displayOfficeHours(team.officeHours.days, team.officeHours.information)} />
                        </div>
                    )}
                </>
            )}

            <div className={rowStyling}>
                  <div className={iconDivStyling}> <img src={slackIcon} alt="Slack kanal" /></div>
                  <TextWithLabel label="Slack" text={!team.slackChannel ? 'Fant ikke slack kanal' : <SlackLink channel={team.slackChannel} />} />
            </div>
            
            <div className={rowStyling}>
                  <div className={iconDivStyling}> <img src={slackIcon} alt="Kontaktperson" /></div>
                  <TextWithLabel
                    label="Kontaktperson"
                    text={team.contactPersonResource ? 
                          <RouteLink href={`/resource/${team.contactPersonResource.navIdent}`}>{team.contactPersonResource.fullName}</RouteLink> 
                          : 'Ingen fast kontaktperson'
                    }
                  />
            </div>


            

        </div>
    )
}

export default LocationSection