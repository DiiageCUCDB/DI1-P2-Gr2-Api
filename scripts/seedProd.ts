// scripts/seedProd.ts
import axios from 'axios';
import { z } from 'zod';

const API_BASE_URL = process.env.PROD_API_URL || 'http://127.0.0.1:8000';

// Zod schemas for validation - matching your API exactly
const CreateUserSchema = z.object({
  username: z.string().min(1).max(50)
});

const CreateChallengeSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().min(1).max(1000),
  difficulty: z.number().int().min(1).max(3),
  isGuildChallenge: z.boolean().default(false)
});

const CreateAnswerSchema = z.object({
  answer: z.string().min(1),
  isCorrect: z.boolean().default(false)
});

const CreateQuestionSchema = z.object({
  challengeId: z.string().uuid(),
  questionText: z.string().min(1),
  points: z.number().default(0),
  answers: z.array(CreateAnswerSchema).min(2).max(2) // Fixed: exactly 2 answers
});

const RequestResponseSchema = z.object({
  userId: z.string().uuid(),
  answerId: z.array(z.string().uuid())
});

// Types
type UserData = z.infer<typeof CreateUserSchema>;
type ChallengeData = z.infer<typeof CreateChallengeSchema>;
type QuestionData = z.infer<typeof CreateQuestionSchema>;
type AnswerData = z.infer<typeof CreateAnswerSchema>;
type ResponseData = z.infer<typeof RequestResponseSchema>;

class DataGenerator {
  // User generation
  static generateUsers(count: number = 5): UserData[] {
    const usernames = [
      'alice_dev', 'bob_coder', 'charlie_tech', 'diana_engineer', 'evan_programmer',
      'fiona_hacker', 'george_developer', 'hannah_coder', 'ivan_tech', 'julia_ai'
    ];

    return usernames.slice(0, count).map(username => ({
      username
    }));
  }

  // Challenge generation
  static generateChallenges(count: number = 5): ChallengeData[] {
    const challenges = [];
    const themes = [
      {
        name: 'JavaScript Basics',
        descriptions: [
          'Test your fundamental JavaScript knowledge with variables and data types',
          'Master JavaScript syntax, functions, and basic programming concepts',
          'Advanced JavaScript concepts including closures and prototypes'
        ],
        difficulties: [1, 2, 3]
      },
      {
        name: 'Web Development',
        descriptions: [
          'HTML and CSS fundamentals for building web pages',
          'Front-end development with modern frameworks and tools',
          'Full-stack web development concepts and best practices'
        ],
        difficulties: [1, 2, 3]
      },
      {
        name: 'Database Concepts',
        descriptions: [
          'Introduction to databases and basic SQL queries',
          'Database design principles and normalization',
          'Advanced SQL and database optimization techniques'
        ],
        difficulties: [1, 2, 3]
      },
      {
        name: 'API Fundamentals',
        descriptions: [
          'Understanding REST API principles and HTTP methods',
          'Building and consuming APIs with authentication',
          'Advanced API design patterns and microservices'
        ],
        difficulties: [1, 2, 3]
      }
    ];

    for (let i = 1; i <= count; i++) {
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const descIndex = Math.floor(Math.random() * theme.descriptions.length);
      const difficulty = theme.difficulties[descIndex];
      const isGuildChallenge = Math.random() < 0.3;

      const challenge = CreateChallengeSchema.parse({
        name: `${theme.name} ${i}`,
        description: theme.descriptions[descIndex],
        difficulty,
        isGuildChallenge
      });

      challenges.push(challenge);
    }

    return challenges;
  }

  // Question and Answer generation - exactly 2 answers per question
  static generateQuestionsForChallenge(challengeId: string, questionCount: number = 3): QuestionData[] {
    const questions: QuestionData[] = [];
    
    const questionTemplates = [
      {
        text: "What is the output of: console.log(typeof null)?",
        points: 10,
        answers: [
          { answer: "object", isCorrect: true },
          { answer: "null", isCorrect: false }
        ]
      },
      {
        text: "Which method adds an element to the end of an array?",
        points: 10,
        answers: [
          { answer: "push()", isCorrect: true },
          { answer: "pop()", isCorrect: false }
        ]
      },
      {
        text: "What does CSS stand for?",
        points: 10,
        answers: [
          { answer: "Cascading Style Sheets", isCorrect: true },
          { answer: "Computer Style Sheets", isCorrect: false }
        ]
      },
      {
        text: "Which HTML tag is used for a hyperlink?",
        points: 10,
        answers: [
          { answer: "<a>", isCorrect: true },
          { answer: "<link>", isCorrect: false }
        ]
      },
      {
        text: "What is the default HTTP method for form submission?",
        points: 10,
        answers: [
          { answer: "GET", isCorrect: true },
          { answer: "POST", isCorrect: false }
        ]
      },
      {
        text: "Which symbol is used for single-line comments in JavaScript?",
        points: 10,
        answers: [
          { answer: "//", isCorrect: true },
          { answer: "/*", isCorrect: false }
        ]
      },
      {
        text: "What does SQL stand for?",
        points: 10,
        answers: [
          { answer: "Structured Query Language", isCorrect: true },
          { answer: "Simple Query Language", isCorrect: false }
        ]
      },
      {
        text: "Which property is used to change text color in CSS?",
        points: 10,
        answers: [
          { answer: "color", isCorrect: true },
          { answer: "text-color", isCorrect: false }
        ]
      },
      {
        text: "What is the correct way to create a function in JavaScript?",
        points: 10,
        answers: [
          { answer: "function myFunction() {}", isCorrect: true },
          { answer: "def myFunction() {}", isCorrect: false }
        ]
      },
      {
        text: "Which HTTP status code means 'Not Found'?",
        points: 10,
        answers: [
          { answer: "404", isCorrect: true },
          { answer: "500", isCorrect: false }
        ]
      }
    ];

    // Shuffle and take the required number of questions
    const shuffledTemplates = [...questionTemplates].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < questionCount && i < shuffledTemplates.length; i++) {
      const template = shuffledTemplates[i];
      
      const question = CreateQuestionSchema.parse({
        challengeId,
        questionText: template.text,
        points: template.points,
        answers: template.answers
      });

      questions.push(question);
    }

    return questions;
  }

  // Response generation
  static generateResponses(userIds: string[], answerIds: string[]): ResponseData[] {
    const responses: ResponseData[] = [];
    
    // Get all available answers
    const availableAnswers = [...answerIds];
    
    // Each user answers some random questions
    for (const userId of userIds) {
      const answersToSubmit: string[] = [];
      const answerCount = Math.min(Math.floor(Math.random() * 5) + 1, availableAnswers.length);
      
      // Select random unique answers
      const shuffled = [...availableAnswers].sort(() => 0.5 - Math.random());
      for (let i = 0; i < answerCount && i < shuffled.length; i++) {
        answersToSubmit.push(shuffled[i]);
      }
      
      if (answersToSubmit.length > 0) {
        responses.push({
          userId,
          answerId: answersToSubmit
        });
      }
    }
    
    return responses;
  }
}

class ProdSeeder {
  private axiosInstance;
  private createdResources: {
    users: string[];
    challenges: string[];
    questions: string[];
    answers: string[];
  };

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000
    });
    this.createdResources = {
      users: [],
      challenges: [],
      questions: [],
      answers: []
    };
  }

  private async delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async healthCheck() {
    try {
      const response = await this.axiosInstance.get('/api/health');
      console.log('✅ API Health:', response.data.result.status);
      return true;
    } catch (error) {
      console.error('❌ Health check failed - API might be unavailable');
      return false;
    }
  }

  // Helper method to get existing resources
  async getExistingResources() {
    try {
      console.log('📋 Checking existing resources...');
      
      // Get existing users
      const usersResponse = await this.axiosInstance.get('/api/ranking/users?limit=50');
      const existingUsers = usersResponse.data.results?.map((user: any) => user.name) || [];
      
      // Get existing challenges
      const challengesResponse = await this.axiosInstance.get('/api/challenges?limit=50');
      const existingChallenges = challengesResponse.data.result?.challenges || [];
      
      console.log(`📊 Found ${existingUsers.length} existing users and ${existingChallenges.length} existing challenges`);
      
      return { existingUsers, existingChallenges };
    } catch (error) {
      console.log('❌ Could not fetch existing resources, starting fresh...');
      return { existingUsers: [], existingChallenges: [] };
    }
  }

  async seedUsers(userCount: number = 5) {
    console.log(`👥 Seeding ${userCount} users...`);
    const { existingUsers } = await this.getExistingResources();
    const users = DataGenerator.generateUsers(userCount);
    const userIds: string[] = [];

    for (const user of users) {
      // Skip if user already exists
      if (existingUsers.includes(user.username)) {
        console.log(`⏭️  User ${user.username} already exists, skipping...`);
        continue;
      }

      try {
        const response = await this.axiosInstance.post('/api/login/create', user);
        userIds.push(response.data.id);
        console.log(`✅ Created user: ${user.username}`);
        await this.delay(200);
      } catch (error: any) {
        console.log(`❌ Failed to create user ${user.username}:`, error.response?.data?.message || error.message);
      }
    }

    this.createdResources.users = userIds;
    return userIds;
  }

  async seedChallenges(challengeCount: number = 3) {
    console.log(`🎯 Seeding ${challengeCount} challenges...`);
    const { existingChallenges } = await this.getExistingResources();
    const challenges = DataGenerator.generateChallenges(challengeCount);
    const challengeIds: string[] = [];

    for (const challenge of challenges) {
      // Check if similar challenge already exists
      const exists = existingChallenges.some((existing: any) => 
        existing.name === challenge.name || 
        existing.description.includes(challenge.name.split(' ')[0])
      );

      if (exists) {
        console.log(`⏭️  Challenge ${challenge.name} already exists, skipping...`);
        continue;
      }

      try {
        const response = await this.axiosInstance.post('/api/challenges', challenge);
        challengeIds.push(response.data.result.id);
        
        const guildIndicator = challenge.isGuildChallenge ? ' [GUILD]' : '';
        const difficultyStars = '★'.repeat(challenge.difficulty) + '☆'.repeat(3 - challenge.difficulty);
        
        console.log(`✅ ${challenge.name}${guildIndicator}`);
        console.log(`   Difficulty: ${difficultyStars} (${challenge.difficulty}/3)`);
        await this.delay(300);
      } catch (error: any) {
        console.log(`❌ Failed to create challenge ${challenge.name}:`, error.response?.data?.message || error.message);
      }
    }

    this.createdResources.challenges = challengeIds;
    return challengeIds;
  }

  async seedQuestionsAndAnswers(challengeIds: string[], questionsPerChallenge: number = 3) {
    console.log(`❓ Seeding questions and answers (${questionsPerChallenge} per challenge, 2 answers each)...`);
    const allAnswerIds: string[] = [];

    for (const challengeId of challengeIds) {
      try {
        // Get challenge details to verify it exists
        await this.axiosInstance.get(`/api/challenges/${challengeId}`);
        
        const questions = DataGenerator.generateQuestionsForChallenge(challengeId, questionsPerChallenge);
        
        for (const question of questions) {
          try {
            const response = await this.axiosInstance.post('/api/questions', question);
            const createdQuestion = response.data.result;
            this.createdResources.questions.push(createdQuestion.id);
            
            console.log(`✅ Created question: ${question.questionText.substring(0, 60)}...`);
            console.log(`   Answers: ${question.answers.map((a: any) => `${a.answer}${a.isCorrect ? ' ✓' : ''}`).join(', ')}`);
            
            // Collect answer IDs for response generation
            createdQuestion.answers.forEach((answer: any) => {
              allAnswerIds.push(answer.id);
            });
            
            await this.delay(300);
          } catch (error: any) {
            console.log(`❌ Failed to create question:`, error.response?.data?.message || error.message);
          }
        }
      } catch (error: any) {
        console.log(`❌ Challenge ${challengeId} not found or error:`, error.response?.data?.message || error.message);
      }
    }

    this.createdResources.answers = allAnswerIds;
    return allAnswerIds;
  }

  async seedResponses(userIds: string[], answerIds: string[]) {
    if (userIds.length === 0 || answerIds.length === 0) {
      console.log('⏭️  No users or answers available for responses, skipping...');
      return 0;
    }

    console.log(`📝 Seeding responses...`);
    const responses = DataGenerator.generateResponses(userIds, answerIds);
    let successCount = 0;

    for (const response of responses) {
      try {
        const submitResponse = await this.axiosInstance.post('/api/responses', response);
        successCount++;
        console.log(`✅ User ${response.userId.substring(0, 8)} submitted ${response.answerId.length} answers - Score: ${submitResponse.data.result?.score || 0}`);
        await this.delay(400);
      } catch (error: any) {
        console.log(`❌ Failed to create response for user ${response.userId.substring(0, 8)}:`, error.response?.data?.message || error.message);
      }
    }

    return successCount;
  }

  async seedEverything(userCount: number = 5, challengeCount: number = 3, questionsPerChallenge: number = 3) {
    console.log('🚀 Starting comprehensive production seed...\n');
    
    const isHealthy = await this.healthCheck();
    if (!isHealthy) {
      console.log('⚠️  Proceeding with seed despite health check failure...\n');
    }

    try {
      // Step 1: Seed Users
      const userIds = await this.seedUsers(userCount);
      console.log(`\n📊 Created ${userIds.length} users\n`);

      // Step 2: Seed Challenges
      const challengeIds = await this.seedChallenges(challengeCount);
      console.log(`\n📊 Created ${challengeIds.length} challenges\n`);

      // Step 3: Seed Questions & Answers
      const answerIds = await this.seedQuestionsAndAnswers(challengeIds, questionsPerChallenge);
      console.log(`\n📊 Created ${this.createdResources.questions.length} questions with ${answerIds.length} answers\n`);

      // Step 4: Seed Responses
      const responseCount = await this.seedResponses(userIds, answerIds);
      console.log(`\n📊 Created ${responseCount} response submissions\n`);

      // Final Summary
      console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
      console.log('===================================');
      console.log(`👥 Users: ${userIds.length}`);
      console.log(`🎯 Challenges: ${challengeIds.length}`);
      console.log(`❓ Questions: ${this.createdResources.questions.length}`);
      console.log(`📝 Answers: ${answerIds.length} (2 per question)`);
      console.log(`📊 Responses: ${responseCount}`);

      return {
        users: userIds.length,
        challenges: challengeIds.length,
        questions: this.createdResources.questions.length,
        answers: answerIds.length,
        responses: responseCount
      };

    } catch (error: any) {
      console.error('💥 Seed failed:', error.message);
      process.exit(1);
    }
  }

  // Method to view ranking after seeding
  async viewRankings(limit: number = 10) {
    console.log(`\n🏆 Checking rankings...`);
    
    try {
      const usersResponse = await this.axiosInstance.get(`/api/ranking/users?limit=${limit}`);
      console.log('\n👥 USER RANKINGS:');
      if (usersResponse.data.results && usersResponse.data.results.length > 0) {
        usersResponse.data.results.forEach((rank: any) => {
          console.log(`   ${rank.rank}. ${rank.name} - ${rank.score} points`);
        });
      } else {
        console.log('   No user rankings available yet');
      }

      const teamsResponse = await this.axiosInstance.get(`/api/ranking/teams?limit=${limit}`);
      console.log('\n�️ TEAM RANKINGS:');
      if (teamsResponse.data.results && teamsResponse.data.results.length > 0) {
        teamsResponse.data.results.forEach((rank: any) => {
          console.log(`   ${rank.rank}. ${rank.name} - ${rank.score} points`);
        });
      } else {
        console.log('   No team rankings available yet');
      }
    } catch (error: any) {
      console.log('❌ Could not fetch rankings:', error.response?.data?.message || error.message);
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const userCount = parseInt(args[0]) || 5;
  const challengeCount = parseInt(args[1]) || 3;
  const questionsPerChallenge = parseInt(args[2]) || 3;
  const showRankings = args.includes('--rankings');

  const seeder = new ProdSeeder();

  console.log('🚀 Comprehensive Production Seeder');
  console.log('==================================\n');

  const results = await seeder.seedEverything(userCount, challengeCount, questionsPerChallenge);

  if (showRankings) {
    await seeder.viewRankings();
  }

  return results;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { ProdSeeder, DataGenerator };