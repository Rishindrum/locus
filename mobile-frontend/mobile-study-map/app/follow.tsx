import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllUsersExceptCurrent, getUserProfile, toggleFollowUser } from '@/backend/backendFunctions';
import ActiveFollowerSessions from '../components/ActiveFollowerSessions';
import { router } from 'expo-router';


export default function FollowScreen() {
  const { user } = useAuth(); // Get the current authenticated user
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users and the current user's following list on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!user || !user.uid) return;

        // Fetch current user's profile to get their following list
        const currentUserProfile = await getUserProfile(user.uid);
        setFollowing(currentUserProfile?.following || []);

        // Fetch all other users
        const otherUsers = await fetchAllUsersExceptCurrent(user.uid);
        setUsers(otherUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle follow/unfollow actions
  const handleFollowToggle = async (targetUserId: string) => {
    try {
      const isCurrentlyFollowing = following.includes(targetUserId);

      // Optimistic UI update
      setFollowing((prev) =>
        isCurrentlyFollowing ? prev.filter((id) => id !== targetUserId) : [...prev, targetUserId]
      );
      console.log('Handle Follow triggered for:', targetUserId);
      // Update Firestore - Note we pass !isCurrentlyFollowing to indicate the desired new state
      await toggleFollowUser(user.uid, targetUserId, !isCurrentlyFollowing);
    } catch (error) {
      console.error('Error updating follow status:', error);

      // Revert UI on error
      setFollowing((prev) =>
        !following.includes(targetUserId)
          ? prev.filter((id) => id !== targetUserId)
          : [...prev, targetUserId]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading users...</Text>
      </View>
    );
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
          <Text style={styles.titleText}>Find People to Follow</Text>
      </View>


      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userName}>{item.name}</Text>
            <TouchableOpacity
              style={[
                styles.followButton,
                following.includes(item.id) && styles.unfollowButton,
              ]}
              onPress={() => handleFollowToggle(item.id)}
            >
              <Text style={styles.buttonText}>
                {following.includes(item.id) ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No other users found</Text>}
      />
      <ActiveFollowerSessions />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    padding: 25,
    backgroundColor: '#FFFBF5',
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DC8B47",
    elevation: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: "#DC8B47",
  },
  followButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#DC8B47',
  },
  unfollowButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },

  titleContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
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

});
