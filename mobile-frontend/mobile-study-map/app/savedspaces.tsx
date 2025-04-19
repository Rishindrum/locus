import { View, ScrollView, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import SmallCard from '../components/SmallCard';
import { useAuth } from '@/contexts/AuthContext';
import { getSavedStudySpaces } from '@/backend/backendFunctions';
import { useEffect, useState } from 'react';

export default function SavedSpacesScreen() {

    const router = useRouter();

    const [savedSpaces, setSavedSpaces] = useState([]);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth(); 

    useEffect(() => {
      const fetchSavedSpaces = async () => {
        try {
          const data = await getSavedStudySpaces(user.uid);
          setSavedSpaces(data);
        } catch (error) {
          console.error('Error fetching saved spaces:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchSavedSpaces();
    }, [user.uid]);

    if (loading) {
      return <ActivityIndicator size="large" color="#DC8B47" />;
    }

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

            {(savedSpaces.length === 0) && 
              <Text style={{ padding: 20 }}>You haven't saved any study spaces yet.</Text>
            }

            
          <ScrollView style={styles.cardContainer}>
              
            {savedSpaces.map((space) => (
                <SmallCard 
                  key={space.spaceId}
                  space={space}
                />
              ))}

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