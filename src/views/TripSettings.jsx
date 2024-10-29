import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  isEnabled,
  Switch,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as colors from "../assets/css/Colors";
import Icon, { Icons } from "../components/Icons";
import {
  f_25,
  bold,
  img_url,
  api_url,
  change_driver_settings,
  get_driver_settings,
  loader,
  payment_methods,
  app_name,
  wallet,
  f_xs,
  f_s,
  f_m,
  f_xl,
  f_30,
  regular,
  f_l,
} from "../config/Constants";
import axios from "axios";
import LottieView from "lottie-react-native";

const TripSettings = (props) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [daily_status, setDailyStatus] = useState(false);
  const [rental_status, setRentalStatus] = useState(false);
  const [outstation_status, setOutstationStatus] = useState(false);
  const [shared_status, setSharedStatus] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", async () => {
      call_get_driver_settings();
    });

    return unsubscribe;
  }, []);

  const go_back = () => {
    navigation.goBack();
  };

  call_get_driver_settings = async () => {
    setLoading(true);
    //console.log({ driver_id: global.id })
    await axios({
      method: "post",
      url: api_url + get_driver_settings,
      data: { driver_id: global.id },
    })
      .then(async (response) => {
        setLoading(false);
        console.log(response.data);
        if (response.data.data.daily_ride_status == 1) {
          setDailyStatus(true);
        }
        if (response.data.data.daily_ride_status == 0) {
          setDailyStatus(false);
        }
        if (response.data.data.rental_ride_status == 1) {
          setRentalStatus(true);
        }
        /* if (response.data.data.rental_ride_status == 0) {
          setRentalStatus(false);
        } */ if (response.data.data.outstation_ride_status == 1) {
          setOutstationStatus(true);
        }
        if (response.data.data.outstation_ride_status == 0) {
          setOutstationStatus(false);
        }
        if (response.data.data.shared_ride_status == 1) {
          setSharedStatus(true);
        }
        if (response.data.data.shared_ride_status == 0) {
          setSharedStatus(false);
        }
      })
      .catch((error) => {
        setLoading(false);
        alert("Sorry something went wrong");
      });
  };
  daily_toggleSwitch = (value) => {
    if (value) {
      setDailyStatus(value);
      call_daily_change_driver_settings(1);
    } else {
      setDailyStatus(value);
      call_daily_change_driver_settings(0);
    }
  };
  rental_toggleSwitch = (value) => {
    if (value) {
      setRentalStatus(value);
      call_rental_change_driver_settings(1);
    } else {
      setRentalStatus(value);
      call_rental_change_driver_settings(0);
    }
  };
  outstation_toggleSwitch = (value) => {
    if (value) {
      setOutstationStatus(value);
      call_outstation_change_driver_settings(1);
    } else {
      setOutstationStatus(value);
      call_outstation_change_driver_settings(0);
    }
  };
  shared_toggleSwitch = (value) => {
    if (value) {
      setSharedStatus(value);
      call_shared_change_driver_settings(1);
    } else {
      setSharedStatus(value);
      call_shared_change_driver_settings(0);
    }
  };

  const call_daily_change_driver_settings = (status) => {
    setLoading(true);
    // console.log({ id: global.id, shared_ride_status: shared_status, daily_ride_status: status, rental_ride_status: rental_status, outstation_ride_status: outstation_status })
    axios({
      method: "post",
      url: api_url + change_driver_settings,
      data: {
        id: global.id,
        shared_ride_status: shared_status,
        daily_ride_status: status,
        rental_ride_status: rental_status,
        outstation_ride_status: outstation_status,
      },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.data == 0) {
          // setDailyStatus(false)
          call_get_driver_settings();
        } else if (response.data.data == 1) {
          // setDailyStatus(true)
          call_get_driver_settings();
        }
      })
      .catch((error) => {
        setLoading(false);
        alert("Sorry something went wrong");
      });
  };

  const call_rental_change_driver_settings = (status) => {
    setLoading(true);
    //console.log({ id: global.id, shared_ride_status: shared_status, daily_ride_status: 0, rental_ride_status: status, outstation_ride_status: outstation_status })
    axios({
      method: "post",
      url: api_url + change_driver_settings,
      data: {
        id: global.id,
        shared_ride_status: shared_status,
        daily_ride_status: daily_status,
        rental_ride_status: status,
        outstation_ride_status: outstation_status,
      },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.data == 0) {
          // setRentalStatus(false);
          call_get_driver_settings();
        } else if (response.data.data == 1) {
          // setRentalStatus(true);
          call_get_driver_settings();
        }
      })
      .catch((error) => {
        setLoading(false);
        alert("Sorry something went wrong");
      });
  };

  const call_outstation_change_driver_settings = (status) => {
    setLoading(true);
    //console.log({ id: global.id, shared_ride_status: shared_status, daily_ride_status: 0, rental_ride_status: rental_status, outstation_ride_status: 0 })
    axios({
      method: "post",
      url: api_url + change_driver_settings,
      data: {
        id: global.id,
        shared_ride_status: shared_status,
        daily_ride_status: daily_status,
        rental_ride_status: rental_status,
        outstation_ride_status: status,
      },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.data == 0) {
          // setOutstationStatus(false);
          call_get_driver_settings();
        } else if (response.data.data == 1) {
          // setOutstationStatus(true);
          call_get_driver_settings();
        }
      })
      .catch((error) => {
        setLoading(false);
        alert("Sorry something went wrong");
      });
  };

  const call_shared_change_driver_settings = (status) => {
    setLoading(true);
    //console.log({ id: global.id, shared_ride_status: status, daily_ride_status: 0, rental_ride_status: rental_status, outstation_ride_status: outstation_status })
    axios({
      method: "post",
      url: api_url + change_driver_settings,
      data: {
        id: global.id,
        shared_ride_status: status,
        daily_ride_status: daily_status,
        rental_ride_status: rental_status,
        outstation_ride_status: outstation_status,
      },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data.data == 0) {
          // setSharedStatus(false);
          call_get_driver_settings();
        } else if (response.data.data == 1) {
          // setSharedStatus(true);
          call_get_driver_settings();
        }
      })
      .catch((error) => {
        setLoading(false);
        alert("Sorry something went wrong");
      });
  };

  return (
    <SafeAreaView style={{ backgroundColor: colors.lite_bg, flex: 1 }}>
      <StatusBar backgroundColor={colors.theme_bg} />
      <View style={[styles.header]}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={go_back.bind(this)}
          style={{
            width: "15%",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon
            type={Icons.MaterialIcons}
            name="arrow-back"
            color={colors.theme_fg_three}
            style={{ fontSize: 30 }}
          />
        </TouchableOpacity>
        <View
          activeOpacity={1}
          style={{
            width: "85%",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: colors.theme_fg_three,
              fontSize: f_xl,
              fontFamily: bold,
            }}
          >
            Trip Settings
          </Text>
        </View>
      </View>
      <View
        style={{
          backgroundColor: colors.theme_bg_three,
          padding: 10,
          margin: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.theme_bg,
        }}
      >
        <View style={{ flexDirection: "row", width: "100%", justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
          <View>
            <Text
              style={{
                fontFamily: bold,
                fontSize: f_m,
                color: colors.theme_fg_two,
              }}
            >
              Enable Daily ride status
            </Text>
          </View>
          <View>
            <Switch
              trackColor={{ false: "#C0C0C0", true: colors.status_online }}
              thumbColor={isEnabled ? "#f5dd4b" : "#fefeff"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={daily_toggleSwitch}
              value={daily_status}
              disabled={loading ? true : false}
            />
          </View>
        </View>
      </View>

      <View style={{ margin: 10 }} />
      <View
        style={{
          backgroundColor: colors.theme_bg_three,
          padding: 10,
          margin: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.theme_bg,
        }}
      >
        <View style={{ flexDirection: "row", width: "100%", justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
          <View>
            <Text
              style={{
                fontFamily: bold,
                fontSize: f_m,
                color: colors.theme_fg_two,
              }}
            >
              Enable Outstation ride status
            </Text>
          </View>
          <View>
            <Switch
              trackColor={{ false: "#C0C0C0", true: colors.status_online }}
              thumbColor={isEnabled ? "#f5dd4b" : "#fefeff"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={outstation_toggleSwitch}
              value={outstation_status}
              disabled={loading ? true : false}
            />
          </View>
        </View>
      </View>
      <View style={{ margin: 10 }} />
      <View
        style={{
          backgroundColor: colors.theme_bg_three,
          padding: 10,
          margin: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.theme_bg,
        }}
      >
        <View style={{ flexDirection: "row", width: "100%", justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
          <View>
            <Text
              style={{
                fontFamily: bold,
                fontSize: f_m,
                color: colors.theme_fg_two,
              }}
            >
              Enable Shared ride status
            </Text>
          </View>
          <View>
            <Switch
              trackColor={{ false: "#C0C0C0", true: colors.status_online }}
              thumbColor={isEnabled ? "#f5dd4b" : "#fefeff"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={shared_toggleSwitch}
              value={shared_status}
              disabled={loading ? true : false}
            />
          </View>
        </View>
      </View>
      <View style={{ margin: 10 }} />
      <View
        style={{
          backgroundColor: colors.theme_bg_three,
          padding: 10,
          margin: 10,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: colors.theme_bg,
        }}
      >
        <View style={{ flexDirection: "row", width: "100%", justifyContent: 'space-between', alignItems: 'center', padding: 10 }}>
          <View>
            <Text
              style={{
                fontFamily: bold,
                fontSize: f_m,
                color: colors.theme_fg_two,
              }}
            >
              Enable Rental ride status
            </Text>
          </View>
          <View>
            <Switch
              trackColor={{ false: "#C0C0C0", true: colors.status_online }}
              thumbColor={isEnabled ? "#f5dd4b" : "#fefeff"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={rental_toggleSwitch}
              value={rental_status}
              disabled={loading ? true : false}
            />
          </View>
        </View>
      </View>
      {loading == true && (
        <View style={{ height: 50, width: "90%", alignSelf: "center" }}>
          <LottieView style={{ flex: 1 }} source={loader} autoPlay loop />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: colors.theme_bg,
    flexDirection: "row",
    alignItems: "center",
  },
});

export default TripSettings;
