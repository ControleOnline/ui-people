/**
 * Presentational sections for Profile page.
 */
import React from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CompactFilterSelector from '@controleonline/ui-default/src/react/components/filters/CompactFilterSelector';

export function ProfileSkeleton({ styles }) {
  return (
    <SafeAreaView style={styles.Profile}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.loadingSkeletonContainer}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.skeletonName} />
          <View style={styles.skeletonEmail} />
        </View>

        <View style={styles.contentContainer}>
          <View style={styles.skeletonSection}>
            <View style={styles.skeletonSectionHeader} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
          </View>

          <View style={styles.skeletonSection}>
            <View style={styles.skeletonSectionHeader} />
            <View style={styles.skeletonLine} />
            <View style={styles.skeletonLine} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function TimezoneSelector({
  styles,
  palette,
  selectedTimezoneId,
  selectedTimezoneLabel,
  timezoneOptions,
  onSelect,
}) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {global.t?.t('people', 'label', 'timezone')}
        </Text>
      </View>

      <CompactFilterSelector
        active={!!selectedTimezoneId}
        accentColor={palette.selectIcon}
        icon="clock"
        label={selectedTimezoneLabel}
        labelCaption={global.t?.t('people', 'label', 'timezone')}
        onSelect={optionKey => {
          onSelect(String(optionKey || '').trim());
        }}
        options={timezoneOptions}
        selectedKey={selectedTimezoneId}
        themeColors={{
          activeChevronColor: palette.selectIcon,
          activeIconColor: palette.selectIcon,
          activeTextColor: palette.selectText,
          backgroundColor: palette.selectBackground,
          borderColor: palette.selectBorder,
          captionColor: palette.selectText,
          chevronColor: palette.selectIcon,
          closeIconColor: palette.selectIcon,
          iconBackgroundColor: palette.selectBackground,
          iconColor: palette.selectIcon,
          modalBackgroundColor: palette.selectBackground,
          modalTitleColor: palette.selectText,
          optionBackgroundColor: palette.selectBackground,
          optionBorderColor: palette.selectBorder,
          optionSelectedTextColor: palette.selectText,
          textColor: palette.selectText,
        }}
        title={global.t?.t('people', 'title', 'select_timezone')}
      />

      {timezoneOptions.length <= 1 && (
        <Text style={styles.emptyText}>
          {global.t?.t('people', 'message', 'no_timezone_available')}
        </Text>
      )}
    </View>
  );
}

export function EditableContactList({ styles, palette, items, setItems, type, formatPhoneValue }) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {type === 'phone' ? global.t?.t("people", "label", "phones") : global.t?.t("people", "label", "email")}
        </Text>
        <TouchableOpacity
          onPress={() => setItems([...items, {id: '', value: ''}])}
          style={styles.addButton}>
          <FeatherIcon name="plus" size={16} color={palette.buttonIcon} />
        </TouchableOpacity>
      </View>
      {items.map((item, index) => (
        <View
          key={`${type}-${item.id || index}`}
          style={[styles.cardItem, styles.cardItemWithActions]}>
          <Icon
            name={type === 'phone' ? 'phone' : 'email'}
            size={20}
            color={palette.cardIcon}
            style={styles.cardIcon}
          />
          <TextInput
            style={styles.input}
            value={item.value}
            onChangeText={text => {
              const newItems = [...items];
              newItems[index] = {
                ...newItems[index],
                value: type === 'phone' ? formatPhoneValue(text) : text,
              };
              setItems(newItems);
            }}
            placeholder={type === 'phone' ? global.t?.t("people", "placeholder", "addPhone") : global.t?.t("people", "placeholder", "addEmail")}
            placeholderTextColor={palette.textSecondary}
            keyboardType={type === 'phone' ? 'phone-pad' : 'email-address'}
            maxLength={type === 'phone' ? 15 : undefined}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => {
              const newItems = items.filter((_, i) => i !== index);
              setItems(newItems);
            }}
            style={styles.deleteAction}>
            <FeatherIcon name="trash-2" size={16} color={palette.buttonIcon} />
          </TouchableOpacity>
        </View>
      ))}
      {items.length === 0 && (
        <Text style={styles.emptyText}>{type === 'phone' ? global.t?.t("people", "message", "noPhoneRegistered") : global.t?.t("people", "message", "noEmailRegistered")}</Text>
      )}
    </View>
  );
}
