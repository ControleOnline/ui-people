import {StyleSheet} from 'react-native';
import globalStyles from '@controleonline/ui-layout/src/react/styles/global';

const css = () => {
  const styles = StyleSheet.create({
    Profile: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    scrollContent: {
      paddingBottom: 20,
    },
    headerContainer: {
      alignItems: 'center',
      padding: 20,
      backgroundColor: '#1E88E5',
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      marginBottom: 10,
      borderWidth: 2,
      borderColor: '#fff',
    },
    userName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 15,
      textAlign: 'center',
    },
    logoutButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      backgroundColor: '#fff',
      borderRadius: 20,
    },
    logoutButtonText: {
      color: '#1E88E5',
      fontWeight: '600',
    },
    contentContainer: {
      padding: 20,
    },
    listContainer: {
      marginBottom: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
    },
    addIcon: {
      color: '#1E88E5',
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: 10,
    },
    input: {
      flex: 1,
      fontSize: 16,
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 4,
      padding: 8,
      marginRight: 10,
      color: '#333',
      backgroundColor: '#fff',
    },
    deleteButton: {
      fontSize: 24,
      color: '#ff4444',
      marginLeft: 10,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: '#333',
    },
  });

  return {styles, globalStyles: globalStyles()};
};

export default css;
