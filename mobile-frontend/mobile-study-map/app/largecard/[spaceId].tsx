import { useLocalSearchParams } from 'expo-router';
import LargeCard from '../../components/LargeCard';

export default function StudySpaceDetailScreen() {
  const { spaceId } = useLocalSearchParams();

  return (
    <LargeCard spaceId={spaceId} />
  );
}