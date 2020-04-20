import * as React from 'react'
import Metadata from '../components/common/Metadata'
import { ProductArea, ProductTeam, ProductAreaFormValues } from '../constants'
import { RouteComponentProps } from 'react-router-dom'
import { getProductArea, editProductArea } from '../api'
import { H4, Label1, Paragraph2 } from 'baseui/typography'
import { Block, BlockProps } from 'baseui/block'
import { theme } from '../util'
import { getAllTeamsForProductArea } from '../api/teamApi'
import ListTeams from '../components/ProductArea/ListTeams'
import { useAwait } from '../util/hooks'
import { user } from '../services/User'
import Button from '../components/common/Button'
import { intl } from '../util/intl/intl'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import ModalProductArea from '../components/ProductArea/ModalProductArea'

const blockProps: BlockProps = {
    display: "flex",
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
}

export type PathParams = { id: string }

const ProductAreaPage = (props: RouteComponentProps<PathParams>) => {
    const [loading, setLoading] = React.useState<boolean>(false)
    const [productArea, setProductArea] = React.useState<ProductArea>()
    const [teams, setTeams] = React.useState<ProductTeam[]>([])
    const [showModal, setShowModal] = React.useState<boolean>(false)
    const [errorModal, setErrorModal] = React.useState()

    const handleSubmit = async (values: ProductAreaFormValues) => {
        try {
            const body = { ...values, id: productArea?.id }
            const res = await editProductArea(body)
            if (res.id) {
                setProductArea(res)
                setShowModal(false)
            }
        } catch (error) {
            setErrorModal(error.message)
        }
    }

    useAwait(user.wait())

    React.useEffect(() => {
        (async () => {
            if (props.match.params.id) {
                setLoading(true)
                const res = await getProductArea(props.match.params.id)
                setProductArea(res)
                if (res) {
                    setTeams((await getAllTeamsForProductArea(props.match.params.id)).content)
                }
                setLoading(false)
            }
        })()

    }, [props.match.params])

    return (
        <>
            {!loading && productArea && (
                <>
                    <Block {...blockProps}>
                        <Block>
                            <H4>{productArea.name}</H4>
                        </Block>
                        {user.canWrite() && (
                            <Block>
                                <Button size="compact" kind="outline" tooltip={intl.edit} icon={faEdit} onClick={() => setShowModal(true)}>
                                    {intl.edit}
                                </Button>
                            </Block>
                        )}
                    </Block>
                    <Block width="100%">
                        <Metadata description={productArea.description} />
                    </Block>
                    <Block marginTop="3rem">
                        <Label1 marginBottom={theme.sizing.scale800}>Teams</Label1>
                        {teams.length > 0 ? <ListTeams teams={teams} /> : <Paragraph2>Ingen teams</Paragraph2>}
                    </Block>

                    <ModalProductArea
                        title="Rediger produktområdet"
                        isOpen={showModal}
                        initialValues={{ name: productArea.name, description: productArea.description }}
                        submit={handleSubmit}
                        onClose={() => setShowModal(false)}
                        errorOnCreate={errorModal}
                    />

                </>
            )}
        </>
    )
}

export default ProductAreaPage
