import {Select, Value} from "baseui/select";
import * as React from "react";
import {Field, FieldProps} from "formik";
import {ProductTeamFormValues, TeamType} from "../../constants";
import {Block} from "baseui/block";

const FieldTeamType = (props: {teamType: TeamType}) => {
  const {teamType} = props
  const [value, setValue] = React.useState<Value>(teamType?[{id:teamType,label:teamType}]:[])
  return (
    <Field
      name='teamType'
      render={({form}: FieldProps<ProductTeamFormValues>) => (
        <Block marginRight='10px' width='100%'>
          <Select
            options={Object.values(TeamType).map(value1 => ({id: value1, label: value1}))}
            onChange={({value}) => {
              setValue(value)
              form.setFieldValue('teamType', value.length > 0 ? value[0].id : '')
              console.log(value)
            }}
            value={value}
            placeholder='Velg en teamtype'
          />
        </Block>
      )}
    />
  )
}

export default FieldTeamType
