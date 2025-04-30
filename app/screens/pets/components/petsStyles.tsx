import { StyleSheet } from 'react-native';
import dimensions from '../../../utils/sizing';

export const petsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  }, 
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: dimensions.screenHeight * 0.02
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  filterButtonActive: {
    backgroundColor: '#ff6b6b',
  },
  filterButtonInactive: {
    backgroundColor: '#f1f1f1',
  },
  filterText: {
    color: '#fff',
  },
  filterTextInactive: {
    color: '#777',
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  petImage: {
    width: dimensions.screenWidth * 0.14,
    height: dimensions.screenWidth * 0.14,
    borderRadius: 100,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: dimensions.screenWidth * 0.038,
    fontFamily: 'Poppins-SemiBold'
  },
  petType: {
    fontSize: dimensions.screenWidth * 0.033,
    color: '#777',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  genderTag: {
    paddingHorizontal: dimensions.screenWidth * 0.02,
    paddingVertical: dimensions.screenHeight * 0.0012,
    alignItems: 'center',
    borderRadius: 12,
  },
  maleTag: {
    backgroundColor: '#466AA2',
  },
  femaleTag: {
    backgroundColor: '#ED7964',
  },
  genderText: {
    color: '#fff',
    fontSize: dimensions.screenWidth * 0.028,
    fontFamily: 'Poppins-SemiBold'
  },
  addButton: {
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  chevron: {
    alignSelf: 'center'
  },
  addPetContainer: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  photoUploadContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    color: '#aaa',
    textAlign: 'center',
    fontSize: 12,
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  formGroup: {
    marginHorizontal: dimensions.screenWidth * 0.05,
  },
  formLabel: {
    fontSize: dimensions.screenWidth * 0.033,
    color: '#808080',
    fontFamily: 'Poppins-Regular',  
    marginBottom: dimensions.screenHeight * 0.01, 
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  optionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  optionIcon: {
    marginRight: 6,
  },
  createButton: {
    backgroundColor: '#ff6b6b',
    marginHorizontal: 16,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Pet Details Modal Styles
  petDetailsModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  petDetailsModalContent: {
    backgroundColor: '#fff',
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  petDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  petDetailsHeaderLeft: {
    flex: 1,
  },
  petDetailsName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  petDetailsType: {
    fontSize: 14,
    color: '#777',
  },
  petDetailsScrollView: {
    flex: 1,
  },
  petDetailsImageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  petDetailsImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  petDetailsSectionContainer: {
    backgroundColor: '#f5f7fa',
    marginHorizontal: 15,
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  petDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  petDetailsInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  petDetailsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e6f0ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  petDetailsInfoLabel: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  petDetailsInfoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  servicesSection: {
    marginHorizontal: 15,
    marginBottom: 20,
  },
  servicesSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  serviceCard: {
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  serviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceCardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  serviceCardDescription: {
    fontSize: 14,
    color: '#777',
  },
  appointmentButton: {
    backgroundColor: '#ff6b6b',
    marginHorizontal: 15,
    marginBottom: 30,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  appointmentButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
 
});