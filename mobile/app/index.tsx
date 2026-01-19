import { Redirect, useRouter } from 'expo-router';
import LandingPage from '../components/LandingPage';
import { useAuth } from '@clerk/clerk-expo';

export default function Index() {
    const { isSignedIn, isLoaded } = useAuth();
    const router = useRouter();

    if (!isLoaded) return null;

    // If somehow we render this while authenticated, redirect
    if (isSignedIn) {
        return <Redirect href="/(tabs)" />;
    }

    return <LandingPage onLogin={() => router.push('/auth/sign-in')} />;
}
