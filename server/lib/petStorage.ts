// Pet storage - reads/writes ~/.claude/pet_data.json

import fs from 'fs';
import path from 'path';
import { PetState, DEFAULT_PET_STATE } from '../types/pet.js';

const CLAUDE_DIR = path.join(process.env.HOME || '', '.claude');
const PET_DATA_FILE = path.join(CLAUDE_DIR, 'pet_data.json');

export function loadPetState(): PetState {
  try {
    if (!fs.existsSync(PET_DATA_FILE)) {
      console.log('No existing pet data, creating new pet');
      return DEFAULT_PET_STATE;
    }

    const content = fs.readFileSync(PET_DATA_FILE, 'utf-8');
    const data = JSON.parse(content);

    return {
      ...DEFAULT_PET_STATE,
      ...data,
    };
  } catch (error) {
    console.error('Failed to load pet data:', error);
    return DEFAULT_PET_STATE;
  }
}

export function savePetState(state: PetState): boolean {
  try {
    // 确保目录存在
    if (!fs.existsSync(CLAUDE_DIR)) {
      fs.mkdirSync(CLAUDE_DIR, { recursive: true });
    }

    fs.writeFileSync(PET_DATA_FILE, JSON.stringify(state, null, 2));
    console.log('Saved pet data');
    return true;
  } catch (error) {
    console.error('Failed to save pet data:', error);
    return false;
  }
}

export function resetPetState(): boolean {
  try {
    if (fs.existsSync(PET_DATA_FILE)) {
      fs.unlinkSync(PET_DATA_FILE);
    }
    return true;
  } catch (error) {
    console.error('Failed to reset pet data:', error);
    return false;
  }
}