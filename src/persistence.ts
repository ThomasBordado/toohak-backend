import * as fs from 'fs';
import { getData, setData } from './dataStore';

// This File hold the persistence functionality

// Function to save data from dataStore to a JSON file
export const saveData = (): void => {
  try {
    fs.writeFileSync('./database.json', JSON.stringify(getData()));
  } catch (error) {
    console.log('Error saving data to database');
  }
};

// Function to update dataStore from a JSON file
export const loadData = (): void => {
  // If a database.json file does not exist, do not try to load anything.
  if (!fs.existsSync('./database.json')) {
    return;
  }

  try {
    const jsonData = fs.readFileSync('./database.json', 'utf8');
    const data = JSON.parse(jsonData);
    setData(data);
  } catch (error) {
    console.log('Error updating data from database');
  }
};

export const clearDataFile = (): void => {
  try {
    fs.unlinkSync('./database.json');
  } catch (error) {
    console.log('Error deleting JSON file');
  }
};
