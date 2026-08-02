import { Platform, StyleSheet } from 'react-native';
import { colors } from '@controleonline/../../src/styles/colors';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  subHeader: {
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 9,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  searchRow: { flexDirection: 'row', alignItems: 'center' },

  filterRow: {
    marginTop: 10,
  },

  tableWrap: {
    flex: 1,
    minHeight: 0,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 40,
  },

  searchInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 8,
    color: colors.text,
    fontSize: 14,
    outlineStyle: 'none',
    outlineWidth: 0,
  },

  clearSearchButton: { padding: 4 },

  importButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    backgroundColor: '#E8F5E9',
  },

  addButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      web: {},
    }),
  },

  contactCard: {
    borderRadius: 16,
    paddingVertical: 14,
  },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },

  avatar: {
    marginRight: 12,
  },

  avatarText: { fontSize: 20, fontWeight: '700' },

  clientName: {
    flex: 1,
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 24,
  },

  clientSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },

  contactLine: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },

  contactTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },

  peopleTypeBadge: {
    borderRadius: 999,
    borderWidth: 1,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  peopleTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.6,
  },

  cardBody: { marginTop: 4 },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 8,
  },

  infoText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
});

export default styles;

export const inlineStyle_133_14 = {
  flex: 1,
};

export const inlineStyle_137_16 = {
  fontSize: 14,
};
