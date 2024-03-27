import * as fs from 'fs';
import { getData, setData } from './dataStore';
// ========================================================================= //
// Functionality for persistence
// Function to save data from dataStore to a JSON file
export const saveData = (): void => {
  try {
    fs.writeFileSync('./database.json', JSON.stringify(getData()));
    // console.log('Data saved successfully to ./database.json');
  } catch (error) {
    // console.error('Error saving data to file: ./database.json', error);
  }
};

// Function to update dataStore from a JSON file
export const loadData = (): void => {
  if (!fs.existsSync('./database.json')) {
    return;
  }
  try {
    const jsonData = fs.readFileSync('./database.json', 'utf8');
    const data = JSON.parse(jsonData);
    setData(data);
    // console.log('DataStore updated from ./database.json');
  } catch (error) {
    // console.error('Error updating dataStore from file: ./database.json');
  }
};

export const clearDataFile = (): void => {
  try {
    fs.unlinkSync('./database.json');
    // console.log(`JSON file deleted successfully.`);
  } catch (error) {
    // console.error(`Error deleting JSON file`, error);
  }
};
