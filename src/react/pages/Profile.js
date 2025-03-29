import React, {useState, useCallback, useEffect} from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import css from '@controleonline/ui-people/src/react/css/people';
import {getStore} from '@store';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import md5 from 'md5';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Profile = ({navigation}) => {
  const {styles, globalStyles} = css();
  const {getters: userGetters, actions: authActions} = getStore('auth');
  const {user} = userGetters;
  const [phones, setPhones] = useState([]);
  const [emails, setEmails] = useState([]);

  // Fetch user data synchronously
  const fetchUser = useCallback(() => {
    setPhones(user?.phone ? [user.phone] : []);
    setEmails(user?.email ? [user.email] : []);
  }, [authActions]);

  // Fetch user when screen is focused
  useFocusEffect(
    useCallback(() => {
      fetchUser();
    }, [fetchUser]),
  );

  // Get Gravatar URL
  const getAvatarUrl = () => {
    if (!user?.email) return 'https://www.gravatar.com/avatar/?d=identicon';
    const emailHash = md5(user.email.trim().toLowerCase());
    return `https://www.gravatar.com/avatar/${emailHash}?s=200&d=identicon`;
  };

  // Handle logout
  const handleLogout = () => {
    authActions.logOut();
  };

  const renderEditableList = (items, setItems, type) => (
    <View style={styles.listContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {type === 'phone' ? 'Phones' : 'Emails'}
        </Text>
        <TouchableOpacity onPress={() => setItems([...items, ''])}>
          <Icon name="add" size={24} color={styles.addIcon.color} />
        </TouchableOpacity>
      </View>
      {items.map((item, index) => (
        <View key={index} style={styles.listItem}>
          <TextInput
            style={styles.input}
            value={item}
            onChangeText={text => {
              const newItems = [...items];
              newItems[index] = text;
              setItems(newItems);
            }}
            placeholder={`Enter ${type}`}
          />
          <TouchableOpacity
            onPress={() => {
              const newItems = items.filter((_, i) => i !== index);
              setItems(newItems);
            }}>
            <Text style={styles.deleteButton}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={styles.Profile}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load user data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.Profile}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Image source={{uri: getAvatarUrl()}} style={styles.avatar} />
          <Text style={styles.userName}>{user.realname}</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contentContainer}>
          {renderEditableList(phones, setPhones, 'phone')}
          {renderEditableList(emails, setEmails, 'email')}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
