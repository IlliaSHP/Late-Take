import Reactotron from 'reactotron-react-native'

if (__DEV__) {
  Reactotron
    .configure({
      name: 'mobile',
      host: '192.168.1.110'        // IP ноутбука в Wi-Fi мережі (видно в логах Expo)
    })
    .useReactNative({
      asyncStorage: false,         // AsyncStorage у проекті нема, токени в SecureStore
      networking: {
        ignoreUrls: /symbolicate/  // не показувати службові запити Metro
      }
    })
    .connect()
}