import { Redirect } from 'expo-router';
import { useEffect } from 'react';

import { useAppSelector } from '@/store/hooks';

export default function Index() {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    useEffect(() => {
        console.log('Index page - isAuthenticated:', isAuthenticated);
    }, [isAuthenticated]);

    // Redirect based on authentication status
    if (isAuthenticated) {
        return <Redirect href="/(tabs)" />;
    }

    return <Redirect href="/auth/login" />;
}
