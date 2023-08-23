import React from 'react';
import {
  View,
  StyleSheet,
  Platform
} from 'react-native';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';

import IcHome from '../img/house_user';
import IcSupervisor from '../img/ic_supervisor';

export default function RelationshipIcon(props) {

  if (props.isInfo) {
    return(
      <View style={{width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', backgroundColor: '#E8D638'}}>
        {props.relationship == 'family_friend' ?
          <IcHome size={14} color='#1B3230'/>
          :props.relationship == 'supervisor' ?
          <IcSupervisor size={14} color='#1B3230'/>
          :props.relationship == 'peer_colleague' ?
          <FontAwesome5 name="hands-helping" size={11} color='#1B3230'/>
          :<View style={{width: 12, height: 12, borderRadius: 12/2, backgroundColor: '#FFFFFF'}} />
        }
      </View>
    )
  }

  return(
    <View style={[style.mainContainer, {
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 54,
        flexDirection: 'row',
        backgroundColor: props.hasReference ? '#4EC5C1' : 'transparent',
        flex: props.hasReference ? 0.15 : null,
        borderRadius: props.hasReference ? 54: 0,
        height: 28
      }, props.style]}>
      <View style={[style.roleContainer, {
        ...Platform.select({
          ios: {
            marginLeft: props.hasReference ? -12 : 0
          },
          android: {
            marginLeft: props.hasReference ? -7 : 0
          }
        })
      }]}>

        {props.relationship != ''  || props.relationship != null || props.relationship != 'null'?
          <>
            {props.relationship == 'family_friend' ?
              <IcHome size={14} color='#1B3230'/>
              :props.relationship == 'supervisor' ?
              <IcSupervisor size={14} color='#1B3230'/>
              :props.relationship == 'peer_colleague' ?
              <FontAwesome5 name="hands-helping" size={11} color='#1B3230'/>
              :<View style={{width: 12, height: 12, borderRadius: 12/2, backgroundColor: '#FFFFFF'}} />
            }
          </>
          :
          <View style={{width: 12, height: 12, borderRadius: 12/2, backgroundColor: '#FFFFFF'}} />
        }

      </View>
      {props.hasReference &&
        <View style={{justifyContent: 'center', alignItems: 'center', paddingLeft: 4}}>
          <Feather name="check" size={16} color="#FFFFFF" />
        </View>
      }
    </View>
  )
}

RelationshipIcon.defaultPropps = {
  hasReference: false,
  isInfo: false,
  relationship: '',
}

const style = StyleSheet.create({
  mainContainer: {
    flex: 0.15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4EC5C1',
    borderRadius: 54,
    flexDirection: 'row'
  },
  roleContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8D638',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    //marginLeft: Platform.OS == 'ios' ? -8 : -1,
    alignItems: 'center',
    justifyContent: 'center'
  }
})
