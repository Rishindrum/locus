import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SmallCard from '../components/SmallCard';

export default function SavedSpacesScreen() {

    const router = useRouter();

    return (
        <View style={styles.container}>

            {/* Container for the title and back arrow */}
            <View style={styles.titleContainer}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Image
                        source={require('../assets/images/arrow_back.png')}
                        style={styles.arrowIcon} 
                    />
                </TouchableOpacity>
                <Text style={styles.titleText}>Saved Spaces</Text>
            </View>


            
          <ScrollView style={styles.cardContainer}>
              <SmallCard
                name="PCL"
                todayHrs="24/7"
                distance={0.6}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/pcl.jpg"
                features="something"
              />
              <SmallCard
                name="Welch"
                todayHrs="8 AM-4:30 PM"
                distance={0.2}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/welch.png"
                features="something"
              />
              <SmallCard
                name="Gates Dell Complex"
                todayHrs="24/7"
                distance={0.1}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/gdc.png"
                features="something"
              />
              <SmallCard
                name="NRG Productivity Center"
                todayHrs="9 AM-5 PM"
                distance={0.4}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/nrg.jpg"
                features="something"
              />

              <SmallCard
                name="Moody (DMC)"
                todayHrs="7 AM-11 PM"
                distance={0.8}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/moody.png"
                features="something"
              />


            </ScrollView>

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
  }, 


  cardContainer: {
    marginTop: 10,
    width: '100%',
    padding: 15,
    paddingBottom: 30,
    flex: 1,
  },
});