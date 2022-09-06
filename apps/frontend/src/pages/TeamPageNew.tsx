import { css } from "@emotion/css"
import { faEdit, faIdCard, faTable } from "@fortawesome/free-solid-svg-icons"
import { BodyShort, Heading, Label } from "@navikt/ds-react"
import moment from "moment"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useParams } from "react-router-dom"
import { editTeam, getProductArea, getResourceById, getTeam, mapProductTeamToFormValue } from "../api"
import { useClusters } from "../api/clusterApi"
import { getContactAddressesByTeamId } from "../api/ContactAddressApi"
import { getProcessesForTeam } from "../api/integrationApi"
import { AuditButton } from "../components/admin/audit/AuditButton"
import Button from "../components/common/Button"
import DescriptionSection from "../components/common/DescriptionSection"
import Divider from "../components/common/Divider"
import { ErrorMessageWithLink } from "../components/common/ErrorBlock"
import LocationSection from "../components/common/LocationSection"
import { Markdown } from "../components/common/Markdown"
import PageTitle from "../components/common/PageTitle"
import ShortSummarySection from "../components/common/ShortSummarySection"
import StatusField from "../components/common/StatusField"
import { AuditName } from "../components/common/User"
import { MemberTable } from "../components/Members/ListMembers/MemberTable"
import { MemberExport } from "../components/Members/MemberExport"
import MembersNew from "../components/Members/MembersNew"
import ModalContactTeam from "../components/Team/ModalContactTeam"
import ModalTeam from "../components/Team/ModalTeam"
import { ContactAddress, Process, ProductArea, ProductTeam, ProductTeamFormValues, Resource, ResourceType } from "../constants"
import { ampli } from "../services/Amplitude"
import { NotificationBell, NotificationType } from "../services/Notifications"
import { user } from "../services/User"
import { processLink } from "../util/config"
import { intl } from "../util/intl/intl"

export type PathParams = { id: string }

const TeamPageNew = () => {
    const params = useParams<PathParams>()
    const [loading, setLoading] = useState<boolean>(false)
    const [team, setTeam] = useState<ProductTeam>()
    const [productArea, setProductArea] = useState<ProductArea>()
    const [processes, setProcesses] = useState<Process[]>([])
    const [errorMessage, setErrorMessage] = useState<string>()
    const clusters = useClusters(team?.clusterIds)
    const [contactAddresses, setContactAddresses] = useState<ContactAddress[]>()
    const [contactPersonResource, setContactPersonResource] = useState<Resource>()
    const [teamOwnerResource, setTeamOwnerResource] = useState<Resource>()
    const [showEditModal, setShowEditModal] = useState<boolean>(false)
    const [showTable, setShowTable] = useState<boolean>(false)
    
    let getExternalLength = () => team ? team?.members.filter((m) => m.resource.resourceType === ResourceType.EXTERNAL).length : 0

    const handleSubmit = async (values: ProductTeamFormValues) => {
        const editResponse = await editTeam(values)
        if (editResponse.id) {
          await updateTeam(editResponse)
          setShowEditModal(false)
          setErrorMessage('')
        } else {
          setErrorMessage(editResponse)
        }
    }

    const updateTeam = async (teamUpdate: ProductTeam) => {
        setTeam(teamUpdate)
    
        if (user.isMemberOf(teamUpdate)) setContactAddresses(teamUpdate.contactAddresses)
    
        if (teamUpdate.productAreaId) {
          const productAreaResponse = await getProductArea(teamUpdate.productAreaId)
          setProductArea(productAreaResponse)
        } else {
          setProductArea(undefined)
        }
    }

    useEffect(() => {
        ;(async () => {
          if (team) {
            if (team.contactPersonIdent) {
              const contactPersonRes = await getResourceById(team.contactPersonIdent)
              setContactPersonResource(contactPersonRes)
            } else {
              setContactPersonResource(undefined)
            }
            if (team.teamOwnerIdent) {
              setTeamOwnerResource(await getResourceById(team.teamOwnerIdent))
            } else {
              setTeamOwnerResource(undefined)
            }
          }
        })()
      }, [team, loading, showEditModal])

    useEffect(() => {
        ;(async () => {
          if (params.id) {
            setLoading(true)
            try {
              const teamResponse = await getTeam(params.id)
              ampli.logEvent('teamkat_view_team', { team: teamResponse.name })
              await updateTeam(teamResponse)
              getProcessesForTeam(params.id).then(setProcesses)
            } catch (err) {
              let errorMessage = 'Failed to do something exceptional'
              if (err instanceof Error) {
                errorMessage = err.message
              }
              console.log(errorMessage)
            }
            setLoading(false)
          }
        })()
      }, [params])

    useEffect(() => {
        if (team && user.isMemberOf(team) && contactAddresses?.length) getContactAddressesByTeamId(team.id).then(setContactAddresses)
        else setContactAddresses([])
    }, [team?.contactAddresses])

    return (
        <div>
            {!loading && !team && <ErrorMessageWithLink errorMessage={intl.teamNotFound} href="/team" linkText={intl.linkToAllTeamsText} />}
            
            {team && (
                <>
                    <div className={css`display: flex; justify-content: space-between;`}>
                      <PageTitle title={team.name} />
                      {team.changeStamp && (
                        <div className={css`margin-top: 0.5rem;`}>
                          <BodyShort size="medium"><b>Sist endret av :</b> <AuditName name={team.changeStamp.lastModifiedBy} /> - {moment(team.changeStamp?.lastModifiedDate).format('lll')}</BodyShort>
                        </div>
                      )}
                    </div>
                    
                    <div className={css`display: flex; justify-content: space-between;`}>
                        <StatusField status={team.status} />
                        {/* Knappene her skal byttes ut med knapper fra designsystemet */}
                        <div className={css`display: flex;`}>
                          <NotificationBell targetId={team.id} type={NotificationType.TEAM} />
                          {user.isAdmin() && <AuditButton id={team.id} marginRight />}
                          {user.canWrite() && (
                            <Button size="compact" kind="outline" icon={faEdit} marginRight onClick={() => setShowEditModal(true)}>
                              {intl.edit}
                            </Button>
                          )}
                          <ModalContactTeam team={team} contactPersonResource={contactPersonResource} />
                        </div>
                    </div>

                    <div className={css`display: grid; grid-template-columns: 0.6fr 0.4fr 0.4fr; grid-column-gap: 1rem; margin-top: 1rem;`}>
                        <DescriptionSection text={<Markdown source={team.description} />}/>
                        <ShortSummarySection 
                            team={team}
                            productArea={productArea}
                            clusters={clusters}
                            contactAddresses={user.isMemberOf(team) ? contactAddresses : undefined}
                        />
                        <LocationSection 
                            team={{...team, contactPersonResource: contactPersonResource}}
                            productArea={productArea}
                            contactAddresses={user.isMemberOf(team) ? contactAddresses : undefined}
                        />
                    </div>
                    <Divider />

                    <div>
                        <div className={css`display: flex; justify-content: space-between; margin-bottom: 1rem;`}>
                            <div className={css`display: flex;`}>
                              <Heading size="large" className={css`margin-right: 2rem;  margin-top: 0px;`}>Medlemmer ({team.members.length > 0 ? team.members.length : '0'})</Heading>
                              <Heading size="small" className={css`margin-top: 0px; font-size: 20px; align-self: center;`}>
                                  Eksterne {getExternalLength()} ({getExternalLength() > 0 ? ((getExternalLength()  / team.members.length) * 100).toFixed(0) : '0'}%)
                              </Heading>
                            </div>

                            {/* Bytte knapper til navdesign */}
                            <div >
                              <MemberExport productAreaId={team.productAreaId ?? null} teamId={team.id} clusterId={null} />
                              <Button tooltip="Skift visningmodus" icon={showTable ? faIdCard : faTable} kind="outline" size="compact" onClick={() => setShowTable(!showTable)}>
                                {showTable ? 'Kortvisning' : 'Tabellvisning'}
                              </Button>
                            </div>
                        </div>

                        {!showTable ? <MembersNew members={team.members} /> : <MemberTable members={team.members} />}
                    </div>
                    <Divider />

                    <div>
                        <span className={css`font-weight: 600; font-size: 18px; line-height: 23px;`}>Behandlinger i behandlingskatalogen</span>
                        {processes
                          .sort((a, b) => (a.purposeName + ': ' + a.name).localeCompare(b.purposeName + ': ' + b.name))
                          .map((p) => (
                            <div className={css`margin-top: 10px;`}>
                              <Link to={processLink(p)} target="_blank" rel="noopener noreferrer" className={css`color: #005077; font-weight: 600; font-size: 16px;`}>
                                {p.purposeName + ': ' + p.name}
                              </Link>
                            </div>
                          ))}
                    </div>

                    <ModalTeam
                      title={'Rediger team'}
                      isOpen={showEditModal}
                      initialValues={mapProductTeamToFormValue(team)}
                      errorMessage={errorMessage}
                      submit={handleSubmit}
                      onClose={() => {
                        setShowEditModal(false)
                        setErrorMessage('')
                      }}
                    />
                </>
            )}

        </div>
    )
}

export default TeamPageNew