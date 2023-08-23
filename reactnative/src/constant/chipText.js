import React from 'react'
import {
    PixelRatio,
    StyleSheet,
    Text,
    View,
} from 'react-native'
import PropTypes from 'prop-types'

const propTypes = {
    text: PropTypes.string,
}

const CHIP_HEIGHT = PixelRatio.roundToNearestPixel(32)
const CHIP_RADIUS = PixelRatio.roundToNearestPixel(16)
const CHIP_MARGIN = PixelRatio.roundToNearestPixel(4)
const CHIP_TEXT_SIZE = PixelRatio.roundToNearestPixel(14)
const CHIP_TEXT_MARGIN = PixelRatio.roundToNearestPixel(16)
const CHIP_LEFT_ICON_SIZE = PixelRatio.roundToNearestPixel(24)
const CHIP_LEFT_ICON_RADIUS = PixelRatio.roundToNearestPixel(12)
const CHIP_RIGHT_ICON_SIZE = PixelRatio.roundToNearestPixel(18)
const CHIP_RIGHT_ICON_RADIUS = PixelRatio.roundToNearestPixel(9)

function MaterialChip(props) {
  return (
      <View
          style={[chipStyle.mainContainer,
              {
                  marginLeft: CHIP_MARGIN,
                  marginRight: CHIP_MARGIN
              }
          ]}
      >
        <View
            style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center'
            }}
        >
            <Text
                style={chipStyle.chipText}
            >
                {props.text}
            </Text>
        </View>
      </View>
  )
}


const chipStyle = StyleSheet.create({
    mainContainer: {
        alignSelf: 'flex-start',
        borderWidth: 0.5,
        minHeight: CHIP_HEIGHT,
        borderRadius: CHIP_RADIUS,
        borderColor: 'rgba(33, 44, 44, 0.15)',
        //margin: CHIP_MARGIN,
        marginTop: 4,
        backgroundColor: '#FFFFFF',
    },
    chipText: {
      color: "#212529",
      fontFamily: 'SFUIDisplay-Regular',
      fontWeight: '400',
      fontSize: 14,
      lineHeight: 17,
      opacity: 0.7,
      paddingLeft: 12,
      paddingRight: 12,
      paddingTop: 4,
      paddingBottom: 4
    }
})

export default MaterialChip
