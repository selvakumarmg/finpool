import { useWindowDimensions } from 'react-native';

export type DeviceSize = 'small' | 'medium' | 'large' | 'xl';

export const useResponsive = () => {
  const { width, height } = useWindowDimensions();
  
  // Device size breakpoints
  const isSmall = width < 375; // iPhone SE, small Android
  const isMedium = width >= 375 && width < 414; // iPhone 12/13, standard Android
  const isLarge = width >= 414 && width < 768; // iPhone Pro Max, large Android
  const isXL = width >= 768; // Tablets
  
  const deviceSize: DeviceSize = isSmall ? 'small' : isMedium ? 'medium' : isLarge ? 'large' : 'xl';
  
  // Responsive font sizes
  const getFontSize = (base: number, scale: number = 0) => {
    if (isSmall) return base - 2;
    if (isMedium) return base;
    if (isLarge) return base + scale;
    return base + scale * 1.5; // XL
  };
  
  // Responsive spacing
  const getSpacing = (base: number) => {
    if (isSmall) return base * 0.8;
    if (isMedium) return base;
    if (isLarge) return base * 1.1;
    return base * 1.2; // XL
  };
  
  return {
    width,
    height,
    deviceSize,
    isSmall,
    isMedium,
    isLarge,
    isXL,
    getFontSize,
    getSpacing,
  };
};

