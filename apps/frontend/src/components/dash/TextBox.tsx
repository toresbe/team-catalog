import { Card } from 'baseui/card'
import { theme } from '../../util'
import { LabelLarge, LabelXSmall, MonoLabelXSmall } from 'baseui/typography'
import { Block } from 'baseui/block'
import { css } from '@emotion/css'

const valueStyle = css({
  marginTop: '1rem',
  marginBottom: '1.5rem',
})

const cardShadow = {
  Root: {
    style: {
      // boxShadow: '0px 0px 6px 3px rgba(230, 241, 248, 1);',
      fontFamily: 'Source Sans Pro',
      borderColor: '#E6F1F8',
      borderWidth: '0.25rem',
    },
  },
}

const iconStyle = css({
  height: '4rem',
  width: '4rem',
})

export const TextBox = (props: { title: string; value: string | number; icon?: string; subtext?: string }) => {
  return (
    <Card overrides={cardShadow}>
      <Block display="flex" flexDirection="column" alignItems="center" justifyContent="space-around" width="15rem" height={theme.sizing.scale4800}>
        {/* {props.icon && <FontAwesomeIcon icon={props.icon} size="2x" color={theme.colors.accent300} />} */}
        {props.icon && <img className={iconStyle} src={props.icon} />}

        <LabelLarge color={'#005077'} $style={{ textAlign: 'center', marginTop: '1rem' }}>
          {props.title}
        </LabelLarge>
        <LabelLarge className={valueStyle} $style={{ fontSize: '2.5em' }}>
          {props.value}
        </LabelLarge>
        {props.subtext ? (
          <label>{props.subtext}</label>
        ) : (
          <label role="hidden" style={{ color: '#ffffff' }}>
            Easter egg
          </label>
        )}
      </Block>
    </Card>
  )
}
