import React, { useState, useEffect, useRef } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    SafeAreaView,
    TextInput,
    StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { normal, bold, regular, update_kyc, api_url, btn_loader, f_xl, f_xs, f_m } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import DropdownAlert, { DropdownAlertData, DropdownAlertType, } from 'react-native-dropdownalert';
import axios from 'axios';
import LottieView from 'lottie-react-native';

const EditIfscCode = (props) => {
    const navigation = useNavigation();
    const [loading, setLoading] = useState(false);
    const [ifsc_code, setIfscCode] = useState('');

    let dropDownAlertRef = useRef(
    (_data?: DropdownAlertData) => new Promise<DropdownAlertData>(res => res),
);
    const inputRef = useRef();

    const go_back = () => {
        navigation.goBack();
    }

    useEffect(() => {
        setTimeout(() => inputRef.current.focus(), 100)
    }, []);


    const check_valid = () => {
        if (ifsc_code) {
            call_update_kyc();
        } else {
            dropDownAlertRef({
                type: DropdownAlertType.Error,
                title: 'Validation error',
                message:'Please enter your IFSC code',
              });
        }
    }

    const call_update_kyc = () => {
        setLoading(true);
        axios({
            method: 'post',
            url: api_url + update_kyc,
            data: { driver_id: global.id, ifsc_code: ifsc_code }
        })
            .then(async response => {
                setLoading(false);
                dropDownAlertRef({
                    type: DropdownAlertType.Success,
                    title: 'Successfully updated',
                    message:'Your IFSC code has been updated.',
                  });
                go_back();
            })
            .catch(error => {
                setLoading(false);
                alert('Sorry something went wrong')
            });
    }



    return (
        <SafeAreaView style={{ backgroundColor: colors.lite_bg, flex: 1 }}>
            <StatusBar
                backgroundColor={colors.theme_bg}
            />
            <View style={[styles.header]}>
                <TouchableOpacity activeOpacity={1} onPress={go_back.bind(this)} style={{ width: '15%', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon type={Icons.MaterialIcons} name="arrow-back" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                </TouchableOpacity>
            </View>
            <View style={{ margin: 20 }} />
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xl, fontFamily: bold }}>Enter your IFSC code</Text>
                <View style={{ margin: 5 }} />
                <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: normal }}>You need enter your IFSC code</Text>
                <View style={{ margin: 20 }} />
                <View style={{ width: '80%' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: '25%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg_three }}>
                            <Icon type={Icons.MaterialCommunityIcons} name="unicode" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                        </View>
                        <View style={{ width: '75%', alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'center', backgroundColor: colors.text_container_bg }}>
                            <TextInput
                                ref={inputRef}
                                secureTextEntry={false}
                                placeholder="IFSC code"
                                placeholderTextColor={colors.grey}
                                style={styles.textinput}
                                onChangeText={TextInputValue =>
                                    setIfscCode(TextInputValue)}
                            />
                        </View>
                    </View>
                    <View style={{ margin: 30 }} />
                    {loading == false ?
                        <TouchableOpacity onPress={check_valid.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>Done</Text>
                        </TouchableOpacity>
                        :
                        <View style={{ height: 50, width: '90%', alignSelf: 'center' }}>
                            <LottieView style={{flex: 1}} source={btn_loader} autoPlay loop />
                        </View>
                    }
                </View>

            </View>
           <DropdownAlert alert={func => (dropDownAlertRef = func)} />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: colors.lite_bg,
        flexDirection: 'row',
        alignItems: 'center'
    },
    textinput: {
        fontSize: f_m,
        color: colors.grey,
        fontFamily: regular,
        height: 60,
        backgroundColor: colors.text_container_bg,
        width: '100%'
    },
});

export default EditIfscCode;