import { Medication } from '../types';

export class ReminderEngine {
  private medications: Medication[] = [];

  // Method to set medications (needed for the ManagementPage)
  setMedications(medications: Medication[]): void {
    this.medications = medications;
    console.log(`📋 ReminderEngine updated with ${medications.length} medications`);
  }

  // Method to get current medications
  getMedications(): Medication[] {
    return this.medications;
  }

  checkMedicationReminders(medications?: Medication[]): string | null {
    const medsToCheck = medications || this.medications;
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`🔍 ReminderEngine checking ${medsToCheck.length} medications for time ${currentTime}`);
    
    for (const medication of medsToCheck) {
      console.log(`⏰ Comparing medication "${medication.name}" time ${medication.time} with current time ${currentTime}`);
      
      if (medication.time === currentTime) {
        const reminder = this.generateMedicationReminder(medication);
        console.log(`✅ Match found! Generated reminder: ${reminder}`);
        return reminder;
      }
    }
    
    console.log('❌ No medication reminders due at this time');
    return null;
  }

  public generateMedicationReminder(medication: Medication): string {
    let message = `It's time for your ${medication.name}`;
    
    if (medication.dosage) {
      message += `. Please take ${medication.dosage}`;
    }
    
    if (medication.notes) {
      message += `. Remember: ${medication.notes}`;
    }
    
    message += '. Please take your medication now.';
    
    return message;
  }

  // Fixed method name and implementation
  getUpcomingReminders(hoursAhead: number = 2): Medication[] {
    const medications = this.medications;
    const now = new Date();
    const upcoming: Medication[] = [];
    
    console.log(`🔍 Getting upcoming reminders for next ${hoursAhead} hours`);
    
    for (const medication of medications) {
      const [hours, minutes] = medication.time.split(':').map(Number);
      const medicationTime = new Date();
      medicationTime.setHours(hours, minutes, 0, 0);
      
      // If medication time has passed today, check for tomorrow
      if (medicationTime < now) {
        medicationTime.setDate(medicationTime.getDate() + 1);
      }
      
      const timeDiff = medicationTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      
      console.log(`⏰ Medication "${medication.name}" is ${hoursDiff.toFixed(2)} hours away`);
      
      if (hoursDiff >= 0 && hoursDiff <= hoursAhead) {
        upcoming.push(medication);
      }
    }

    // Sort by actual time object, not string
    const sorted = upcoming.sort((a, b) => {
      const [aH, aM] = a.time.split(':').map(Number);
      const [bH, bM] = b.time.split(':').map(Number);
      return aH !== bH ? aH - bH : aM - bM;
    });

    console.log(`✅ Found ${sorted.length} upcoming reminders:`, sorted.map(m => `${m.name} at ${m.time}`));
    return sorted;
  }

  // Get medications due today (useful for daily overview)
  getTodaysSchedule(): Medication[] {
    return this.medications.sort((a, b) => {
      const [aH, aM] = a.time.split(':').map(Number);
      const [bH, bM] = b.time.split(':').map(Number);
      return aH !== bH ? aH - bH : aM - bM;
    });
  }

  // Helper method to check if a medication is due within the next few minutes
  isMedicationDueSoon(medication: Medication, minutesAhead: number = 5): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const [hours, minutes] = medication.time.split(':').map(Number);
    const medicationTime = new Date();
    medicationTime.setHours(hours, minutes, 0, 0);
    
    // Calculate time difference in minutes
    const diffMs = medicationTime.getTime() - now.getTime();
    const diffMin = diffMs / (1000 * 60);

    // Check if medication is due now or within the next few minutes
    // Also handle case where medication time has just passed (within 2 minutes)
    const isDueNow = diffMin >= -2 && diffMin <= minutesAhead;
    
    // Note: You'll need to add lastRemindedAt to your Medication type if you want to use this
    const alreadyReminded = (medication as any).lastRemindedAt === currentTime;
    
    console.log(`⏰ Medication "${medication.name}" scheduled for ${medication.time}, current time ${currentTime}, diff: ${diffMin.toFixed(1)} min, isDue: ${isDueNow}, alreadyReminded: ${alreadyReminded}`);

    return isDueNow && !alreadyReminded;
  }

  // Get next medication reminder
  getNextReminder(): { medication: Medication; minutesUntil: number } | null {
    const now = new Date();
    let nextMedication: Medication | null = null;
    let shortestWait = Infinity;

    for (const medication of this.medications) {
      const [hours, minutes] = medication.time.split(':').map(Number);
      const medicationTime = new Date();
      medicationTime.setHours(hours, minutes, 0, 0);
      
      // If medication time has passed today, check for tomorrow
      if (medicationTime < now) {
        medicationTime.setDate(medicationTime.getDate() + 1);
      }
      
      const timeDiff = medicationTime.getTime() - now.getTime();
      const minutesUntil = timeDiff / (1000 * 60);
      
      if (minutesUntil < shortestWait) {
        shortestWait = minutesUntil;
        nextMedication = medication;
      }
    }

    if (nextMedication && shortestWait !== Infinity) {
      return {
        medication: nextMedication,
        minutesUntil: Math.round(shortestWait)
      };
    }

    return null;
  }

  // Check all medications and return any that are due now
  checkAllRemindersNow(): Medication[] {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    return this.medications.filter(medication => {
      // Check exact time match first
      if (medication.time === currentTime) {
        return true;
      }
      
      // Also check if it's within the "due soon" window
      return this.isMedicationDueSoon(medication, 1); // 1 minute window
    });
  }

  // Get a summary of today's medication schedule
  getDailyScheduleSummary(): string {
    if (this.medications.length === 0) {
      return "No medications scheduled for today.";
    }

    const schedule = this.getTodaysSchedule();
    const summary = schedule.map(med => `${med.name} at ${med.time}`).join(', ');
    
    return `Today's medication schedule: ${summary}.`;
  }

  // Format time until next medication in human-readable format
  formatTimeUntilNext(): string {
    const next = this.getNextReminder();
    
    if (!next) {
      return "No upcoming medications";
    }

    const { medication, minutesUntil } = next;
    
    if (minutesUntil < 60) {
      return `${medication.name} in ${minutesUntil} minutes`;
    } else {
      const hours = Math.floor(minutesUntil / 60);
      const minutes = minutesUntil % 60;
      return `${medication.name} in ${hours}h ${minutes}m`;
    }
  }
}