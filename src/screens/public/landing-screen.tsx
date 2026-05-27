import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ImageBackground, Pressable, Text, View } from 'react-native';
import type { RootStackParamList } from '@/navigation/types';
import { images } from '@/components/assets';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export function LandingScreen({ navigation }: Props) {
  return (
    <ImageBackground
      source={images.background}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1 px-5 justify-center">
        <View className="gap-2 mb-6">
          <Text className="text-3xl font-extrabold text-text text-center mt-10">Tu envío ya tiene quien lo lleve.</Text>
          <Text className="text-base text-text/70 text-center">Regístrate para crear envíos o repartir ordenes.</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 gap-3 shadow-2xl">
          <Text className="text-xl font-bold text-text">Crear cuenta</Text>
          <Text className="text-sm text-text/70">Elige el tipo de cuenta para comenzar tu registro.</Text>

          <Pressable
            onPress={() => navigation.navigate('Register', { role: 'cliente' })}
            className="py-3.5 px-4 rounded-xl items-center justify-center bg-primary active:bg-primary-pressed"
          >
            <Text className="text-white text-base font-bold">Cliente</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Register', { role: 'repartidor' })}
            className="py-3.5 px-4 rounded-xl border-2 border-primary items-center justify-center bg-white"
          >
            <Text className="text-primary text-base font-bold">Repartidor</Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.navigate('Login')}
            className="py-3 px-4 rounded-xl border border-border items-center justify-center"
          >
            <Text className="text-text text-sm font-bold">Ya tengo cuenta</Text>
          </Pressable>
        </View>
      </View>
    </ImageBackground>
  );
}