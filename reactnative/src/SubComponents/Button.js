import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const Button = ({ title, extraStyle, onPress }) => {
    return (
        <TouchableOpacity style={[styles.container, extraStyle]} onPress={onPress}>
            <Text style={styles.title}>{title}</Text>
        </TouchableOpacity>
    )
}

export default Button

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4EC5C1',
        borderRadius: 10,
        height: 40,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        color: "#FFFFFF",
        fontSize: 16,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 19,
    }
})