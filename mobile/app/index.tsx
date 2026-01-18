import { Redirect } from 'expo-router';
import LandingPage from '../components/LandingPage';
import { useAuth } from '../context/ctx';

export default function Index() {
    const { signIn, isAuthenticated } = useAuth();

    // If somehow we render this while authenticated, redirect
    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <LandingPage onLogin={signIn} />;
}
