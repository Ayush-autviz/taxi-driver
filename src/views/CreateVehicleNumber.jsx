import React, { useState, useEffect, useRef } from "react";
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    View,
    SafeAreaView,
    TextInput,
    Keyboard,
    StatusBar
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from '../assets/css/Colors';
import { normal, bold, regular, f_xl, f_xs, f_m } from '../config/Constants';
import Icon, { Icons } from '../components/Icons';
import DropdownAlert, { DropdownAlertData, DropdownAlertType, } from 'react-native-dropdownalert';
import { connect } from 'react-redux';
import { updateVehicleNumber } from '../actions/VehicleDetailActions';

const CreateVehicleNumber = (props) => {
    const navigation = useNavigation();
    const [vehicle_number, setVehicleNumber] = useState('');
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
        if (vehicle_number) {
            navigate();
        } else {
            dropDownAlertRef({
                type: DropdownAlertType.Error,
                title: 'Validation error',
                message:'Please enter your vehicle number',
              });
            
        }
    }

    const navigate = async () => {
        Keyboard.dismiss()
        props.updateVehicleNumber(vehicle_number);
        go_back();
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
                <Text numberOfLines={1} style={{ color: colors.theme_fg_two, fontSize: f_xl, fontFamily: bold }}>Enter your vehicle number</Text>
                <View style={{ margin: 5 }} />
                <Text numberOfLines={1} style={{ color: colors.grey, fontSize: f_xs, fontFamily: normal }}>You need enter your vehicle number</Text>
                <View style={{ margin: 20 }} />
                <View style={{ width: '80%' }}>
                    <View style={{ flexDirection: 'row' }}>
                        <View style={{ width: '25%', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.theme_bg_three }}>
                            <Icon type={Icons.Octicons} name="number" color={colors.theme_fg_two} style={{ fontSize: 30 }} />
                        </View>
                        <View style={{ width: '75%', alignItems: 'flex-start', paddingLeft: 10, justifyContent: 'center', backgroundColor: colors.text_container_bg }}>
                            <TextInput
                                ref={inputRef}
                                secureTextEntry={false}
                                placeholder="Vehicle Number"
                                placeholderTextColor={colors.grey}
                                style={styles.textinput}
                                onChangeText={TextInputValue =>
                                    setVehicleNumber(TextInputValue)}
                            />
                        </View>
                    </View>
                    <View style={{ margin: 30 }} />
                    <TouchableOpacity onPress={check_valid.bind(this)} activeOpacity={1} style={{ width: '100%', backgroundColor: colors.btn_color, borderRadius: 10, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: colors.theme_fg_two, fontSize: f_m, color: colors.theme_fg_three, fontFamily: bold }}>Done</Text>
                    </TouchableOpacity>
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

const mapDispatchToProps = (dispatch) => ({
    updateVehicleNumber: (data) => dispatch(updateVehicleNumber(data)),
});

export default connect(null, mapDispatchToProps)(CreateVehicleNumber);