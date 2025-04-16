import { useLocalSearchParams } from 'expo-router';
import LargeCard from '../../components/LargeCard';

export default function StudySpaceDetailScreen() {
  const { name, todayHrs, distance, features, imageURL } = useLocalSearchParams();

  if (!name || !imageURL) return null;

  return (
    <LargeCard />
  );
}