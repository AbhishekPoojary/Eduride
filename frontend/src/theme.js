import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6f1ff',
      100: '#b8d4ff',
      200: '#8ab7ff',
      300: '#5c9aff',
      400: '#2e7dff',
      500: '#0064ff', // Primary brand color
      600: '#0050cc',
      700: '#003c99',
      800: '#002866',
      900: '#001433',
    },
    secondary: {
      50: '#f5f9ff',
      100: '#eaf2ff',
      200: '#d5e5ff',
      300: '#b3d1ff',
      400: '#80b3ff',
      500: '#4d94ff',
      600: '#1a75ff',
      700: '#0059cc',
      800: '#003d8a',
      900: '#001f47',
    },
  },
  fonts: {
    heading: '"Poppins", sans-serif',
    body: '"Inter", sans-serif',
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'bold',
        borderRadius: 'md',
      },
      variants: {
        primary: {
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
        },
        secondary: {
          bg: 'secondary.500',
          color: 'white',
          _hover: {
            bg: 'secondary.600',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'md',
        },
      },
    },
  },
});

export default theme;
