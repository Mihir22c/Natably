import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'

const Chip = ({ extraStyle, title, titleStyle, onPressChip, disabled }) => {
    return (
        <TouchableOpacity style={[styles.container, extraStyle]} onPress={onPressChip} activeOpacity={0.5} disabled={disabled}>
            <Text style={[styles.title, titleStyle]}>{title}</Text>
        </TouchableOpacity>
    )
}

export default Chip

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#1B32300D',
        marginEnd: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    title: {
        color: "#212C2CB2",
        fontSize: 12,
        fontFamily: 'SFUIDisplay-Regular',
        flexWrap: 'wrap',
        fontWeight: "600"
    }
})