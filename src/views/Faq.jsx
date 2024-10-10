//List
import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { StyleSheet, View, Text, Animated, TouchableOpacity, FlatList, StatusBar ,ScrollView, SafeAreaView} from 'react-native';
//import { ScrollView } from '@gemcook/react-native-animated-scroll-view';
import * as colors from '../assets/css/Colors';
import Icon, { Icons } from '../components/Icons';
import { normal, bold, api_url, faq, maxHeaderHeight, minHeaderHeight, f_30, f_s, f_xl } from '../config/Constants';
import axios from 'axios';

const DATA = Array.from({ length: 30 }).map((_, index) => ({ id: index }));
const HEADER_SCROLL_DISTANCE = maxHeaderHeight - minHeaderHeight;

const Faq = (props) => {
    const navigation = useNavigation();
    const animatedScrollYValue = useRef(new Animated.Value(0)).current;
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState("");

    const headerHeight = animatedScrollYValue.interpolate({
        inputRange: [120, HEADER_SCROLL_DISTANCE],
        outputRange: [0, 1],
        extrapolate: 'clamp',
    });

    const go_back = () => {
        navigation.goBack();
    }

    useEffect(() => {
        call_faq();
    }, []);

    const call_faq = () => {
        setLoading(true);
        axios({
            method: 'post',
            url: api_url + faq,
            data: { lang: global.lang }
        })
            .then(async response => {
                setLoading(false);
                setData(response.data.result)
            })
            .catch(error => {
                setLoading(false);
                alert('Sorry something went wrong')
            });
    }

    navigate_faq_details = (data) => {
        navigation.navigate('FaqDetails', { data: data });
    }

    const animated_header = () => {
        return (
            <View style={styles.animationHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity style={{ width: '30%', alignItems: 'flex-start', justifyContent: 'center', height: 60, paddingLeft: 17 }}>
                        <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_three} style={{ fontSize: 30 }} />
                    </TouchableOpacity>
                </View>
                <View style={{ padding: 30, alignItems: 'center' }}>
                    <Text numberOfLines={2} ellipsizeMode='tail' style={{ color: colors.theme_fg_three, fontSize: f_30, letterSpacing: 1, fontFamily: bold, textAlign: 'center' }}>How can we help you?</Text>
                </View>
            </View>
        )
    }

    const show_list = ({ item }) => (
        <TouchableOpacity activeOpacity={1} onPress={navigate_faq_details.bind(this, item)} style={{ flexDirection: 'row', padding: 20 }}>
            <View style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                <Icon type={Icons.MaterialIcons} name="notes" color={colors.icon_inactive_color} style={{ fontSize: 22 }} />
            </View>
            <View style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
                <Text style={{ color: colors.theme_fg_two, fontSize: f_s, fontFamily: normal }}>{item.question}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                backgroundColor={colors.theme_bg}
            />
                  <View style={[styles.header]}>
        <TouchableOpacity activeOpacity={1} onPress={go_back.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
          <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_three} style={{ fontSize: 30 }} />
        </TouchableOpacity>
        <View activeOpacity={1} style={{ width: '85%', alignItems: 'flex-start', justifyContent: 'center' }}>
          <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_three, fontSize: f_xl, fontFamily: bold }}>FAQ</Text>
        </View>
      </View>
            {/* <ScrollView
                maxHeaderHeight={maxHeaderHeight}
                minHeaderHeight={minHeaderHeight}
                onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: animatedScrollYValue } } }])}
                AnimationHeaderComponent={
                    animated_header()
                }

            > */}
                <View style={{ margin: 5 }} />
                <FlatList
                    data={data}
                    renderItem={show_list}
                    keyExtractor={item => item.id}
                />
            {/* </ScrollView> */}
            {/* <Animated.View opacity={headerHeight} style={[styles.header]}>
                <TouchableOpacity activeOpacity={1} onPress={go_back.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_three} style={{ fontSize: 30 }} />
                </TouchableOpacity>
                <View style={{ margin: '2%' }} />
                <TouchableOpacity style={{ width: '83%', alignItems: 'flex-start', justifyContent: 'center' }}>
                    <Text numberOfLines={1} ellipsizeMode='tail' style={{ color: colors.theme_fg_three, fontSize: f_xl, fontFamily: bold }}>FAQ's</Text>
                </TouchableOpacity>
            </Animated.View> */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    animationHeader: {
        backgroundColor: colors.theme_bg,
        height: '100%',
        width: '100%',
    },
    header: {
        height: 60,
        flexDirection: 'row',
        backgroundColor: colors.btn_color,
        alignItems: 'center'
    },
    title: {
        backgroundColor: 'transparent',
        color: 'white',
        fontSize: 18,
    },
});

export default Faq;