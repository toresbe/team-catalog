import {Option, Select, Value} from "baseui/select";
import * as React from "react";
import {Field, FieldProps} from "formik";
import {ProductTeamFormValues} from "../../constants";
import {Block} from "baseui/block";

const FieldProductArea = (props: { options: Option[], initialValue: Value }) => {
  const {options, initialValue} = props
  const [value, setValue] = React.useState<Value>(initialValue)

  return (
    <Field
      name='productAreaId'
      render={({form}: FieldProps<ProductTeamFormValues>) => (
        <Block marginRight='10px' width='100%'>
          <Select
            options={options}
            onChange={({value}) => {
              setValue(value)
              form.setFieldValue('productAreaId', value.length > 0 ? value[0].id : '')
              console.log(value)
            }}
            value={value}
            placeholder='Velg ett produktområde'
          />
        </Block>
      )}
    />
  )
}

export default FieldProductArea
