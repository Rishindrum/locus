import React, { useState, useEffect } from 'react';
import { View, Image, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAllUsersExceptCurrent, getUserProfile, toggleFollowUser } from '@/backend/backendFunctions';
import ActiveFollowerSessions from '../components/ActiveFollowerSessions';
import { router } from 'expo-router';

export default function FollowScreen() {
  const { user } = useAuth(); // Get the current authenticated user
  const [users, setUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  // Filter users based on search query (name or email)
  const filteredUsers = users.filter(user => {
    const query = search.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

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

      {/* Search Bar */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search by name or email..."
        value={search}
        onChangeText={setSearch}
        placeholderTextColor="#aaa"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Image
              source={item.pfp ? { uri: item.pfp } : require('../assets/images/pfp_drishti.png')}
              style={styles.userPfp}
            />
            <View style={styles.userInfoContainer}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userEmail}>{item.email}</Text>
            </View>
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
    alignItems: 'center',
    padding: 16,
    marginVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#DC8B47",
    elevation: 2,
  },
  userPfp: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 14,
    backgroundColor: '#eee',
  },
  userInfoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: "#DC8B47",
  },
  userEmail: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
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
  searchBar: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#DC8B47',
    color: '#333',
  },
});
