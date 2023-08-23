import React from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  Image,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
//import Swipeable from 'react-native-gesture-handler/Swipeable';
import Swipeout from 'react-native-swipeout';
import DropShadow from "react-native-drop-shadow";
import ChipText from './chipText';

const { width, height } = Dimensions.get('window');

function FeedbackContentItem(props) {
  const { rowData, onAcceptClick, onDismissClick, commonHeight, feedbackAction, feedbackRowId, onUndoClick, styleContainer, feedbackLastDeletedRow } = props;

  if (feedbackRowId == rowData.id) {
    return (
      <View style={[style.feedbackActionContainer, { borderColor: feedbackAction == 'Accept' ? 'rgba(21, 191, 180, 0.4)' : 'rgba(249, 84, 61, 0.4)' }]}>
        <View style={{ flex: 0.90, flexDirection: 'row', flexWrap: 'wrap' }}>
          <Text style={{ color: feedbackAction == 'Accept' ? '#15BFB4' : '#F9543D', fontFamily: 'SFUIDisplay-Regular', fontWeight: '400', fontSize: 14, textAlign: 'left', }}>
            {feedbackAction == 'Accept' && <Text style={{ color: '#15BFB4', fontFamily: 'SFUIDisplay-Bold', fontWeight: '700', fontSize: 14 }}>1 Point </Text>}
            {feedbackAction == 'Accept' ? `has been added to the ${rowData.thumbnailName} bar of your talent profile chart above.` : 'Talent point dismissed'}
          </Text>
        </View>
        <TouchableOpacity onPress={() =>
          onUndoClick()
        } style={{ marginLeft: 10, backgroundColor: 'rgba(27, 50, 48, 0.05)', borderRadius: 3, padding: 8, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#1B3230', fontFamily: 'SFUIDisplay-Regular', fontWeight: '400', fontSize: 14 }}>Undo</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (feedbackAction == 'cancelled' && feedbackLastDeletedRow == rowData.id) {
    return (<View />)
  }

  return (
    <DropShadow style={styleContainer}>
      <Swipeout
        style={{ borderRadius: 20, marginBottom: 8, marginTop: 8 }}
        autoClose={true}
        backgroundColor={'#FFFFFF'}
        left={[{ text: 'Accept', backgroundColor: '#15BFB4', type: 'primary', onPress: () => { onAcceptClick(); } }]}
        right={[{ text: 'Dismiss', type: 'delete', backgroundColor: '#F9543D', onPress: () => { onDismissClick(); } }]}>

        <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#FFFFFF', paddingTop: 16, paddingLeft: 20, paddingBottom: 16, borderRadius: 20 }}>
          <View style={{ flexDirection: 'row' }}>
            <Image style={{ width: commonHeight, height: commonHeight, backgroundColor: 'transparent' }} resizeMode="contain" source={{ uri: 'http://natably.com/images/thumbnails/' + rowData.thumbnailUrl }} />

            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: 'transparent', marginLeft: 8, marginTop: 10 }}>
              <Text style={style.feedbackTitle} numberOfLines={1}>{rowData.thumbnailName}</Text>
              <Text style={style.feedbackContent} >{rowData.feedback}</Text>
              {rowData.skills.length != 0 &&
                <Text style={style.skillTitle} >Skills</Text>
              }
              <View style={{ marginTop: 5 }}>
                {rowData.skills.map((row) => {
                  return (
                    <ChipText
                      text={row}
                    />
                  )
                })}
              </View>
            </View>
          </View>
        </View>
      </Swipeout>
    </DropShadow>
  )
}

const style = StyleSheet.create({
  feedbackTitle: {
    color: "#212C2C",
    fontSize: 16,
    paddingLeft: 4,
    paddingTop: 4,
    flexWrap: 'wrap',
    fontWeight: '700',
    fontFamily: 'SFUIDisplay-Bold',
    lineHeight: 22
  },
  feedbackContent: {
    color: "rgba(33, 44, 44, 0.85)",
    fontSize: 14,
    paddingLeft: 4,
    paddingRight: 28,
    paddingTop: 4,
    flexWrap: 'wrap',
    lineHeight: 22,
    fontFamily: 'SFUIDisplay-Regular',
    lineHeight: 17,
    letterSpacing: 0.005
  },
  skillTitle: {
    fontFamily: 'SFUIDisplay-Bold',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    color: 'rgba(33, 44, 44, 0.5)',
    paddingLeft: 4,
    lineHeight: 14,
    marginTop: 11
  },
  dismissContainer: {
    flex: 1, //flex: 0.5,
    backgroundColor: '#F9543D',
    //borderTopRightRadius: 20,
    //borderBottomRightRadius: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 20
  },
  acceptContainer: {
    flex: 1,
    backgroundColor: '#4EC5C1',
    //borderTopLeftRadius: 20,
    //borderBottomLeftRadius: 20,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 20
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontFamily: 'SFUIDisplay-Regular',
    fontWeight: '400'
  },
  feedbackActionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    height: 84,
    borderWidth: 1,
    borderColor: 'rgba(21, 191, 180, 0.4)',
    borderStyle: 'dashed',
    marginBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
  },
});

export default FeedbackContentItem;
