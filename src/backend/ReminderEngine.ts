import { Medication } from '../types';

export class ReminderEngine {
  checkMedicationReminders(medications: Medication[]): string | null {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    console.log(`🔍 ReminderEngine checking ${medications.length} medications for time ${currentTime}`);
    
    for (const medication of medications) {
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

  getUpcomingReminders(medications: Medication[], hoursAhead: number = 2): Medication[] {
    const now = new Date();
    const upcoming: Medication[] = [];
    
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
      
      if (hoursDiff >= 0 && hoursDiff <= hoursAhead) {
        upcoming.push(medication);
      }
    }

      // Sort by actual time object, not string
    return upcoming.sort((a, b) => {
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
    
    const diffMin = Math.abs((medicationTime.getTime() - now.getTime()) / (1000 * 60));

    const alreadyReminded = medication.lastRemindedAt === currentTime;

    return diffMin <= minutesAhead && !alreadyReminded;
  }
}