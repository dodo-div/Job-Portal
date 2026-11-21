import PeopleSearch from '../components/PeopleSearch';
import { useAuth } from '../context/AuthContext';

export default function FindContacts() {
  const { user } = useAuth();
  return <PeopleSearch contacts allowed={user.role !== 'seeker'} />;
}
