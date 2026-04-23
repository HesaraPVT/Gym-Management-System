/**
 * Calculate body fat percentage using Jackson-Pollock 3-site formula
 * Works for both men and women
 * 
 * For Men: Uses chest, abdomen (waist), and thigh circumferences
 * For Women: Uses triceps, abdomen (waist), and suprailium circumferences
 * 
 * Simplified version uses: waist, weight, height
 */

export const calculateBodyFat = (measurements, gender = 'male') => {
  const { weight, height, chest, waist, arms, legs, shoulders } = measurements;

  // Validate required fields
  if (!weight || !height || !waist) {
    return null; // Cannot calculate without minimum data
  }

  // Convert height from cm to inches if needed for calculation
  const heightInInches = height / 2.54;
  const weightInLbs = weight * 2.20462; // Convert kg to lbs

  // Simplified Katch-McArdle formula approximation
  // This is a reasonable estimation for general fitness tracking
  let bodyFatPercentage;

  if (gender.toLowerCase() === 'male') {
    // Male formula using waist, weight, height
    // Body Fat % = (1.0324 - (0.19077 * log10(waist - neck)) + (0.15456 * log10(height))) * 100
    // Simplified version without neck measurement:
    
    let waistInInches = waist / 2.54;
    let estimatedNeckInches = 15; // Average neck for males if not provided
    
    const neckAdjustment = waistInInches - estimatedNeckInches;
    if (neckAdjustment <= 0) {
      // Fallback to simpler formula
      bodyFatPercentage = ((weightInLbs / (height * height)) * 703 * 1.71) - 74.5;
    } else {
      bodyFatPercentage = (1.0324 - (0.19077 * Math.log10(neckAdjustment)) + (0.15456 * Math.log10(heightInInches))) * 100;
    }
  } else {
    // Female formula
    let waistInInches = waist / 2.54;
    let hipsInInches = (legs || waist) / 2.54; // Use legs as proxy for hips if not provided
    let estimatedNeckInches = 13; // Average neck for females
    
    const circumferenceAdjustment = waistInInches + hipsInInches - estimatedNeckInches;
    if (circumferenceAdjustment <= 0) {
      bodyFatPercentage = ((weightInLbs / (height * height)) * 703 * 1.48) - 58;
    } else {
      bodyFatPercentage = (1.29579 - (0.35004 * Math.log10(circumferenceAdjustment)) + (0.22100 * Math.log10(heightInInches))) * 100;
    }
  }

  // Ensure result is within reasonable range (0-60%)
  bodyFatPercentage = Math.max(5, Math.min(60, bodyFatPercentage));

  return Math.round(bodyFatPercentage * 10) / 10; // Round to 1 decimal place
};

/**
 * Calculate BMI (Body Mass Index)
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

/**
 * Get body fat category
 */
export const getBodyFatCategory = (bodyFatPercentage, gender = 'male') => {
  if (!bodyFatPercentage) return 'Unknown';

  if (gender.toLowerCase() === 'male') {
    if (bodyFatPercentage < 6) return 'Extremely Low';
    if (bodyFatPercentage < 14) return 'Athletic';
    if (bodyFatPercentage < 18) return 'Fitness';
    if (bodyFatPercentage < 25) return 'Acceptable';
    return 'High';
  } else {
    if (bodyFatPercentage < 14) return 'Extremely Low';
    if (bodyFatPercentage < 21) return 'Athletic';
    if (bodyFatPercentage < 25) return 'Fitness';
    if (bodyFatPercentage < 32) return 'Acceptable';
    return 'High';
  }
};
