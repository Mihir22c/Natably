import React, { Component } from 'react';

import {
  StyleSheet,
  Text,
  View,
  findNodeHandle,
  Platform,
  TouchableWithoutFeedback,
  Modal,
  Image,
} from 'react-native';
import { BlurView } from "@react-native-community/blur";

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    backgroundColor: 'rgba(33, 44, 44, 0.3)',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});


class BlurModel extends Component {

  constructor(props) {
    super(props);
    this.state = { viewRef: null };
  }

  onViewLoaded() {
    this.setState({ viewRef: findNodeHandle(this.viewRef) });
  }

  _renderOutsideTouchable(onTouch) {
      const view = <View style={{ flex: 1, width: '100%' }} />

      if (!onTouch) return view;

      return (
          <TouchableWithoutFeedback onPress={onTouch} style={{ flex: 1, width: '100%' }}>
              {view}
          </TouchableWithoutFeedback>
      )
  }

  render() {
    const {
      visible, onTouchOutside} = this.props;
    return (

         <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onTouchOutside}>
           <BlurView
             style={styles.absolute}
             viewRef={this.state.viewRef}
             blurType="light"
             reducedTransparencyFallbackColor="black"
             blurAmount={5}>
              {Platform.OS == 'ios' && this._renderOutsideTouchable(onTouchOutside)}
              {this.props.children}
              {Platform.OS == 'ios' && this._renderOutsideTouchable(onTouchOutside)}
            </BlurView>
         </Modal>

    );
  }
}

BlurModel.defaultProps = {
  visible: false,
  onTouchOutside: ()=> {}
};

export default BlurModel;
