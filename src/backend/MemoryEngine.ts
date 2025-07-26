import { PatientProfile, MemoryPrompt } from '../types';

export class MemoryEngine {
  generateMemoryPrompt(profile: PatientProfile, memories: MemoryPrompt[]): string {
    const prompts = [
      ...this.generateIdentityPrompts(profile),
      ...this.generateFamilyPrompts(profile),
      ...this.generatePersonalMemoryPrompts(memories),
      ...this.generateRoutinePrompts()
    ];

    if (prompts.length === 0) {
      return "Hello! I'm here with you today. How are you feeling?";
    }

    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    return randomPrompt;
  }

  private generateIdentityPrompts(profile: PatientProfile): string[] {
    const prompts: string[] = [];
    
    if (profile.name) {
      prompts.push(
        `Hello ${profile.name}! It's wonderful to see you today.`,
        `Good day, ${profile.name}. I hope you're feeling well.`,
        `Hi there, ${profile.name}. You're looking great today!`
      );
    }

    if (profile.age) {
      prompts.push(
        `You have so much wisdom from your ${profile.age} years of life.`,
        `At ${profile.age}, you've experienced so many wonderful things.`
      );
    }

    return prompts;
  }

  private generateFamilyPrompts(profile: PatientProfile): string[] {
    const prompts: string[] = [];
    
    profile.familyMembers.forEach(member => {
      prompts.push(
        `Do you remember ${member.name}? They're your ${member.relationship} and they love you very much.`,
        `${member.name}, your ${member.relationship}, thinks about you often.`,
        `Your ${member.relationship} ${member.name} cares about you deeply.`
      );
    });

    return prompts;
  }

  private generatePersonalMemoryPrompts(memories: MemoryPrompt[]): string[] {
    return memories
      .filter(memory => memory.type === 'memory')
      .map(memory => `Do you remember ${memory.content}? That was such a special time.`);
  }

  private generateRoutinePrompts(): string[] {
    const now = new Date();
    const hour = now.getHours();
    
    const prompts: string[] = [];

    if (hour >= 6 && hour < 12) {
      prompts.push(
        "Good morning! It's a beautiful day to start fresh.",
        "The morning sun is shining just for you today.",
        "What a lovely morning! I hope you slept well."
      );
    } else if (hour >= 12 && hour < 17) {
      prompts.push(
        "Good afternoon! How has your day been so far?",
        "The afternoon is perfect for reflecting on happy memories.",
        "It's a peaceful afternoon. Take a moment to relax."
      );
    } else if (hour >= 17 && hour < 21) {
      prompts.push(
        "Good evening! The day is winding down nicely.",
        "What a pleasant evening. Time to take things easy.",
        "The evening is here. Perfect time for some quiet reflection."
      );
    } else {
      prompts.push(
        "It's getting late. Time to rest and recharge.",
        "The night is peaceful. Sweet dreams await you.",
        "Time to wind down for the evening. You've had a good day."
      );
    }

    return prompts;
  }

  generateWellnessCheck(): string {
    const checks = [
      "How are you feeling right now? Remember, I'm here to help.",
      "Have you had some water recently? Staying hydrated is important.",
      "Are you comfortable? Let me know if you need anything.",
      "Take a deep breath with me. In... and out. You're doing great.",
      "Remember, you are loved and cared for. You're not alone."
    ];

    return checks[Math.floor(Math.random() * checks.length)];
  }

  generateEncouragement(): string {
    const encouragements = [
      "You are strong, capable, and loved.",
      "Every day is a gift, and you make it brighter.",
      "Your presence brings joy to those around you.",
      "You have touched so many lives in wonderful ways.",
      "You are valued, respected, and cherished."
    ];

    return encouragements[Math.floor(Math.random() * encouragements.length)];
  }
}