import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const FilterSection = ({
  title,
  icon,
  options,
}: {
  title: string;
  icon: React.ReactNode;
  options: string[];
}) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const toggleOption = (option: string) => {
    setSelectedOptions((prev) =>
      prev.includes(option)
        ? prev.filter((opt) => opt !== option)
        : [...prev, option]
    );
  };

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
      >
        <View style={styles.sectionTitle}>
          {icon}
          <Text style={styles.sectionText}>{title}</Text>
        </View>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={20} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                selectedOptions.includes(option) && styles.optionSelected,
              ]}
              onPress={() => toggleOption(option)}
            >
              <Text
                style={[
                  styles.optionText,
                  selectedOptions.includes(option) && styles.optionTextSelected,
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function FiltersScreen() {

    const router = useRouter();

    return (
        <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close-circle-outline" size={28} color="#DC8B47" />
            </TouchableOpacity>
        </View>

        {/* Scrollable Filter Sections */}
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
            <FilterSection
            title="Noise Level"
            icon={<Ionicons name="volume-high" size={18} />}
            options={['Quiet', 'Moderate', 'Loud']}
            />
            <FilterSection
            title="Temperature"
            icon={<Ionicons name="thermometer" size={18} />}
            options={['Cold', 'Moderate', 'Hot']}
            />
            <FilterSection
            title="Outlets"
            icon={<MaterialCommunityIcons name="power-plug-outline" size={18} />}
            options={['Few', 'Moderate', 'Plenty']}
            />
            <FilterSection
            title="Seating Types"
            icon={<MaterialCommunityIcons name="seat-outline" size={18} />}
            options={['Couches', 'Wooden Chairs', 'Booths', 'Padded Chairs']}
            />
            <FilterSection
            title="Cleanliness"
            icon={<MaterialCommunityIcons name="broom" size={18} />}
            options={['Low', 'Moderate', 'High']}
            />
            <FilterSection
            title="Lighting"
            icon={<MaterialCommunityIcons name="lightbulb-on-outline" size={18} />}
            options={['Artificial', 'Natural', 'Soft', 'Warm', 'Overhead']}
            />
            <FilterSection
            title="Aesthetics"
            icon={<Ionicons name="sparkles-outline" size={18} />}
            options={['Dark Academia', 'Corporate', 'Cozy', 'Minimalistic', 'Modern']}
            />


        </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#FFFBF5',
      paddingHorizontal: 20,
      paddingTop: 70,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontWeight: '600',
      color: '#DC8B47',
    },
    sectionContainer: {
      marginBottom: 30,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionTitle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    sectionText: {
      fontSize: 18,
      fontWeight: '500',
      marginLeft: 6,
    },
    optionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
      gap: 10,
    },
    optionButton: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: '#DC8B47',
    },
    optionSelected: {
      backgroundColor: '#DC8B47',
    },
    optionText: {
      color: '#DC8B47',
      fontWeight: '500',
    },
    optionTextSelected: {
      color: 'white',
    },
  });
