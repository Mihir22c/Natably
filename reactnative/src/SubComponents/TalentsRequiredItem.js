import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const TalentsRequired = ({ extraStyle, imageStyle, item, titleStyle }) => {

    const { name, description, color, user_feedbacks, image } = item
    return (
        <View style={[styles.container, extraStyle, titleStyle, imageStyle]}>
            <View style={styles.innerContainer}>
                <Image style={[styles.image, imageStyle]} source={{ uri: image }} />
                <Text style={[styles.title, titleStyle, { color: color }]}>{name}</Text>
            </View>
            <View style={styles.descContainer}>
                <Text style={styles.descText}>{description}</Text>
            </View>
        </View>
    )
}

export default TalentsRequired

const styles = StyleSheet.create({
    container: {

    },
    image: {
        height: 38,
        width: 38,
    },
    title: {
        color: '#4EC5C1',
        fontSize: 14,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '700',
        lineHeight: 17,
        letterSpacing: 0.5,
        marginStart: 12
    },
    innerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 12
    },
    descContainer: {
        borderColor: '#F5F5F5',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
    },
    descText: {
        color: '#212C2C',
        fontSize: 16,
        flexWrap: 'wrap',
        fontFamily: 'SFUIDisplay-Regular',
        fontWeight: '500',
        lineHeight: 22,
        letterSpacing: 0.5
    }
})