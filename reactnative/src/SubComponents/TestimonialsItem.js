import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Image } from 'react-native'

const TestimonialsItem = ({ extraStyle, item, onPress, selected }) => {
    const { name, has_reference, testimonial, relationship, company } = item
    return (
        <>
            <TouchableOpacity style={[styles.container, extraStyle]} activeOpacity={0.5} onPress={onPress}>
                <View style={styles.topCon}>
                    <Text style={styles.title}>{name}</Text>
                    {has_reference === true && <Image style={styles.checkImage} source={require('../img/check.png')} />}
                </View>
                {relationship !== '' || company !== '' ? <Text style={styles.subTitle}>{`${relationship}${relationship !== '' && company !== '' ? ',' : ''} ${company}`}</Text> : null}
                <Text style={styles.descText}>{testimonial}</Text>
            </TouchableOpacity>
        </>
    )
}

export default TestimonialsItem

const styles = StyleSheet.create({
    container: {
        borderColor: '#E9E9E9',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginVertical: 6
    },
    topCon: {
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        color: "#79AFF9",
        fontSize: 14,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '700',
        lineHeight: 17
    },
    subTitle: {
        color: "#10827B",
        fontSize: 12,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 15,
        textTransform: "capitalize"
    },
    descText: {
        color: "#212C2C",
        fontSize: 16,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 22,
        marginTop: 10,
    },
    checkImage: {
        height: 16,
        width: 16,
        marginStart: 10
    }
})