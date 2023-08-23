import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const ImageButton = ({ image, extraStyle, imageStyle, onPress }) => {
    return (
        <TouchableOpacity style={[styles.container, extraStyle]} activeOpacity={0.5} onPress={onPress}>
            <Image style={[styles.image, imageStyle]} source={image} />
        </TouchableOpacity>
    )
}

export default ImageButton

const styles = StyleSheet.create({
    container: {
    },
    image: {
        height: 20,
        width: 20,
        resizeMode: 'contain'
    }
})