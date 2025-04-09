import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function StudyLogScreen() {

    const router = useRouter();

    return (
        <View style={styles.container}>

            {/* Container for the title and back arrow */}
            <View style={styles.titleContainer}>
                <TouchableOpacity onPress={() => router.push('/settings')}>
                    <Image
                        source={require('../assets/images/arrow_back.png')}
                        style={styles.arrowIcon} 
                    />
                </TouchableOpacity>
                <Text style={styles.titleText}>Study Log</Text>
            </View>

        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    backgroundColor: '#FFFBF5', // You can modify this for dark mode
  },
  titleContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#DC8B47",
  },
  arrowIcon: {
    width: 30,
    height: 30,
    marginRight: 20,
  }
});