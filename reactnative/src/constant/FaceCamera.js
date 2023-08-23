import { View, Text, StyleSheet } from 'react-native'
import React, { useRef } from 'react'
import { RNCamera } from 'react-native-camera';

const FaceCamera = ({ orientation }) => {

    const cameraREF = useRef(null)

    return (
        // <View style={styles.container}>
        <View style={{ flex: 0, width: orientation === 'PORTRAIT' ? 200 : 150, height: orientation === 'PORTRAIT' ? 150 : 200, position: 'absolute', alignSelf: 'flex-end', top: '15%', borderRadius: 20, overflow: 'hidden', end: '2%' }}>
            <RNCamera
                ref={cameraREF}
                style={{ flex: 1, borderRadius: 20 }}
                type={RNCamera.Constants.Type.front}
                androidCameraPermissionOptions={{
                    title: 'Permission to use camera',
                    message: 'We need your permission to use your camera',
                    buttonPositive: 'Ok',
                    buttonNegative: 'Cancel',
                }}
            />
        </View>
        // </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
export default FaceCamera